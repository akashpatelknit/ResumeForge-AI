"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
// @codemirror/lang-stex does not exist on npm — STeX/LaTeX highlighting for
// CodeMirror 6 only ships via the legacy-modes bridge (MIT, official
// CodeMirror project). A more full-featured Lezer grammar exists as the
// third-party `codemirror-lang-latex`, but it's AGPL-3.0-licensed, which is
// a real consideration for a commercial app — swap to it deliberately, not
// by accident, if richer highlighting is worth that tradeoff.
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { linter, lintGutter, forceLinting, type Diagnostic } from "@codemirror/lint";
import { basicSetup } from "codemirror";
import type { LatexDiagnostic } from "@/types/latex";

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  diagnostics?: LatexDiagnostic[];
  readOnly?: boolean;
  className?: string;
}

export default function LatexEditor({
  value,
  onChange,
  diagnostics = [],
  readOnly = false,
  className,
}: LatexEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const diagnosticsRef = useRef<Diagnostic[]>([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Editor is created once on mount. Later `value` changes from outside
  // (e.g. finishing an async load) are synced via the effect below instead
  // of tearing down and recreating the view, which would lose cursor
  // position, undo history, and scroll offset on every prop update.
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        StreamLanguage.define(stex),
        keymap.of([indentWithTab]),
        lintGutter(),
        linter(() => diagnosticsRef.current, { delay: 0 }),
        updateListener,
        EditorView.editable.of(!readOnly),
        EditorView.theme({
          "&": { height: "100%", fontSize: "13px" },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (e.g. the resume's saved source arriving
  // after an async fetch) without disturbing local edits already in flight.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  // Compile errors come from an async server round-trip, not from live
  // typing, so we can't rely on CodeMirror's automatic re-lint-on-change.
  // Push them into the ref the linter reads from, then force a re-lint.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const doc = view.state.doc;
    const converted: Diagnostic[] = diagnostics.map((d) => {
      const lineNumber = Math.min(Math.max(d.line, 1), doc.lines);
      const line = doc.line(lineNumber);
      const col = d.column && d.column > 0 ? d.column - 1 : 0;
      const from = Math.min(line.from + col, line.to);
      return {
        from,
        to: line.to,
        severity: d.severity,
        message: d.message,
      };
    });

    diagnosticsRef.current = converted;
    forceLinting(view);
  }, [diagnostics]);

  return <div ref={containerRef} className={className} />;
}
