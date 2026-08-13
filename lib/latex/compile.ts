import "server-only";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import type { LatexDiagnostic } from "@/types/latex";
import { parseTectonicLog } from "./parseTectonicLog";

const COMPILE_TIMEOUT_MS = 10_000;
const MAX_LOG_BUFFER_BYTES = 2 * 1024 * 1024; // stdout+stderr cap
const MAX_PDF_BYTES = 20 * 1024 * 1024; // compiled output cap
const MAX_SOURCE_BYTES = 2 * 1024 * 1024; // input cap, checked before spawning

// Tectonic caches its downloaded package bundle under a platform-specific
// directory under $HOME (Linux: ~/.cache/Tectonic, macOS:
// ~/Library/Caches/TectonicProject.Tectonic — it uses each OS's native
// convention, not a single fixed relative path). That cache MUST live at a
// real, writable, persistent home directory — not the per-request temp dir,
// and not a hardcoded path that doesn't exist on the current OS.
//
// In the Docker image (see Dockerfile), TECTONIC_CACHE_HOME is explicitly
// set to /home/tectonic, matching the build-time warm-up compile that
// pre-populates exactly that path. Locally (macOS/Linux dev), falling back
// to the real os.homedir() instead of a hardcoded Linux path is required —
// "/home/tectonic" doesn't exist as a valid path root on macOS at all,
// which made every local compile fail before Tectonic even got to the .tex
// file (it panics trying to create its cache dir under a nonexistent root).
const TECTONIC_HOME = process.env.TECTONIC_CACHE_HOME || homedir();

export interface CompileSuccess {
  ok: true;
  pdf: Buffer;
}

export interface CompileFailure {
  ok: false;
  message: string;
  diagnostics: LatexDiagnostic[];
  rawLog: string;
}

export type CompileResult = CompileSuccess | CompileFailure;

interface ExecFileError extends Error {
  code?: number | string;
  killed?: boolean;
  signal?: NodeJS.Signals | null;
  stdout?: string | Buffer;
  stderr?: string | Buffer;
}

/**
 * Compiles LaTeX source with Tectonic in a per-request temp directory.
 *
 * Security-relevant properties this function relies on / enforces:
 * - Never passes any shell-escape-enabling flag. Tectonic does not implement
 *   classic TeX \write18/shell-escape at all, unlike pdflatex/xelatex — do
 *   not "fix" a compile failure by trying to add one.
 * - Runs via execFile with an argv array (not a shell string), so LaTeX
 *   source content can never be interpreted as shell syntax.
 * - Bounded by a hard timeout and output-size caps so a pathological or
 *   hostile document can't hang the process or exhaust disk/memory.
 * - The temp directory is unique per call and always removed in `finally`.
 *
 * NOT enforced here (needs infra-level sandboxing — see docs/PROJECT_OVERVIEW.md
 * or the deployment notes in the Dockerfile): outbound network access during
 * compilation, filesystem isolation from the rest of the host, and CPU/memory
 * cgroup limits. Tectonic only hits the network to fetch missing packages into
 * its bundle cache — pre-warming that cache at image-build time (see Dockerfile)
 * means a correctly-built image should need zero network access per request,
 * but nothing in this function *prevents* a network call if the cache misses.
 * True network isolation requires running this in a locked-down container/exec
 * sandbox (e.g. gVisor, Firecracker, or `--network none` on a dedicated worker).
 */
export async function compileLatex(source: string): Promise<CompileResult> {
  if (Buffer.byteLength(source, "utf8") > MAX_SOURCE_BYTES) {
    return {
      ok: false,
      message: "LaTeX source is too large to compile (max 2MB).",
      diagnostics: [],
      rawLog: "",
    };
  }

  const workDir = await mkdtemp(join(tmpdir(), "latex-compile-"));
  const texPath = join(workDir, "main.tex");
  const pdfPath = join(workDir, "main.pdf");

  try {
    await writeFile(texPath, source, "utf8");

    let stdout = "";
    let stderr = "";

    try {
      const result = await execFileAsync("tectonic", [
        "--outdir",
        workDir,
        "--reruns",
        "1",
        // Verified via `tectonic --help` (v0.17.0): disables shell-escape
        // and other "known-insecure features" even if someone later adds
        // a -Z flag enabling them elsewhere in this command. Belt-and-
        // suspenders on top of simply never passing -Z shell-escape.
        "--untrusted",
        texPath,
      ], {
        cwd: workDir,
        timeout: COMPILE_TIMEOUT_MS,
        killSignal: "SIGKILL",
        maxBuffer: MAX_LOG_BUFFER_BYTES,
        // Minimal, explicit env — deliberately NOT inheriting the full
        // process.env (which may hold DB credentials, API keys, etc. that
        // a LaTeX subprocess has no business seeing). NODE_ENV is only here
        // because @types/node's global ProcessEnv augmentation requires it.
        // HOME is the fixed, pre-warmed Tectonic cache dir (see const above),
        // NOT workDir — using workDir here would defeat the whole point of
        // pre-warming the cache at image-build time.
        env: {
          PATH: process.env.PATH ?? "",
          HOME: TECTONIC_HOME,
          NODE_ENV: process.env.NODE_ENV ?? "production",
        },
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error) {
      const err = error as ExecFileError;
      stdout = toStr(err.stdout);
      stderr = toStr(err.stderr);
      const rawLog = stdout + stderr;

      if (err.killed || err.signal === "SIGKILL") {
        return {
          ok: false,
          message: `Compilation timed out after ${COMPILE_TIMEOUT_MS / 1000}s.`,
          diagnostics: [],
          rawLog,
        };
      }

      return {
        ok: false,
        message: "LaTeX compilation failed.",
        diagnostics: parseTectonicLog(rawLog),
        rawLog,
      };
    }

    const rawLog = stdout + stderr;
    const pdfStat = await stat(pdfPath).catch(() => null);

    if (!pdfStat) {
      return {
        ok: false,
        message: "Compilation finished but no PDF was produced.",
        diagnostics: parseTectonicLog(rawLog),
        rawLog,
      };
    }

    if (pdfStat.size > MAX_PDF_BYTES) {
      return {
        ok: false,
        message: "Compiled PDF exceeds the maximum allowed size (20MB).",
        diagnostics: [],
        rawLog,
      };
    }

    const pdf = await readFile(pdfPath);
    return { ok: true, pdf };
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

function toStr(value: string | Buffer | undefined): string {
  if (!value) return "";
  return typeof value === "string" ? value : value.toString("utf8");
}

function execFileAsync(
  command: string,
  args: string[],
  options: {
    cwd: string;
    timeout: number;
    killSignal: NodeJS.Signals;
    maxBuffer: number;
    env: NodeJS.ProcessEnv;
  },
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      {
        cwd: options.cwd,
        timeout: options.timeout,
        killSignal: options.killSignal,
        maxBuffer: options.maxBuffer,
        env: options.env,
        encoding: "utf8",
      },
      (error, stdout, stderr) => {
        if (error) {
          const err = error as ExecFileError;
          err.stdout = stdout;
          err.stderr = stderr;
          reject(err);
          return;
        }
        resolve({ stdout, stderr });
      },
    );
  });
}
