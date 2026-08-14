"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  Star,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Search,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useResumeStore } from "@/store/resumeStore";
import type { Project } from "@/types/resume";
import type { GeneratedProjectFromRepo } from "@/lib/ai/generateProjectFromRepo";

interface GitHubImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GitHubRepoSummary {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
  htmlUrl: string;
  topics: string[];
}

type Step = "username" | "repos" | "review";

interface RepoGenState {
  status: "loading" | "success" | "error";
  error?: string;
  accepted?: boolean;
}

async function fetchGeneratedProject(
  repo: GitHubRepoSummary,
): Promise<GeneratedProjectFromRepo> {
  const res = await fetch("/api/ai/generate-project-from-repo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repoFullName: repo.fullName,
      repoDescription: repo.description ?? undefined,
      language: repo.language ?? undefined,
      topics: repo.topics,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Generation failed");
  return data.result as GeneratedProjectFromRepo;
}

export default function GitHubImportModal({
  open,
  onOpenChange,
}: GitHubImportModalProps) {
  const { addProject } = useResumeStore();

  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [repos, setRepos] = useState<GitHubRepoSummary[]>([]);
  const [includeForks, setIncludeForks] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());

  const [genState, setGenState] = useState<Record<string, RepoGenState>>({});
  const [editedFields, setEditedFields] = useState<
    Record<string, GeneratedProjectFromRepo>
  >({});

  const resetAll = () => {
    setStep("username");
    setUsername("");
    setFetchError(null);
    setRepos([]);
    setIncludeForks(false);
    setSelectedRepos(new Set());
    setGenState({});
    setEditedFields({});
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      // Accepted projects already landed in the store via addProject when
      // "Accept" was clicked, so closing the modal never loses them — only
      // unreviewed/still-generating repos are discarded. Reset after the
      // close animation so content doesn't visibly flash away first.
      setTimeout(resetAll, 200);
    }
  };

  const fetchRepos = async (forks = includeForks) => {
    if (!username.trim()) return;
    setIsFetchingRepos(true);
    setFetchError(null);
    try {
      const res = await fetch(
        `/api/github/repos?username=${encodeURIComponent(username.trim())}${forks ? "&includeForks=true" : ""}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to fetch repositories");
      setRepos(data.repos);
      setSelectedRepos(new Set());
      setStep("repos");
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch repositories",
      );
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const toggleForks = (next: boolean) => {
    setIncludeForks(next);
    fetchRepos(next);
  };

  const toggleSelect = (fullName: string) => {
    setSelectedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) next.delete(fullName);
      else next.add(fullName);
      return next;
    });
  };

  const runGeneration = async (repo: GitHubRepoSummary) => {
    setGenState((prev) => ({
      ...prev,
      [repo.fullName]: { status: "loading" },
    }));
    try {
      const result = await fetchGeneratedProject(repo);
      setGenState((prev) => ({
        ...prev,
        [repo.fullName]: { status: "success" },
      }));
      setEditedFields((prev) => ({ ...prev, [repo.fullName]: result }));
    } catch (err) {
      setGenState((prev) => ({
        ...prev,
        [repo.fullName]: {
          status: "error",
          error: err instanceof Error ? err.message : "Generation failed",
        },
      }));
    }
  };

  const handleImportSelected = () => {
    const targets = repos.filter((r) => selectedRepos.has(r.fullName));
    setStep("review");
    // Independent, parallel generations — one repo's failure/slowness
    // doesn't block the others' preview cards from appearing.
    targets.forEach((repo) => {
      void runGeneration(repo);
    });
  };

  const handleAccept = (fullName: string) => {
    const edited = editedFields[fullName];
    if (!edited) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name: edited.projectName,
      description: edited.description,
      technologies: edited.techStack,
      highlights: edited.highlights,
      github: repos.find((r) => r.fullName === fullName)?.htmlUrl,
    };
    addProject(project);
    setGenState((prev) => ({
      ...prev,
      [fullName]: { ...prev[fullName], status: "success", accepted: true },
    }));
  };

  const handleDiscard = (fullName: string) => {
    setGenState((prev) => {
      const next = { ...prev };
      delete next[fullName];
      return next;
    });
    setEditedFields((prev) => {
      const next = { ...prev };
      delete next[fullName];
      return next;
    });
  };

  const reviewTargets = repos.filter(
    (r) => selectedRepos.has(r.fullName) && genState[r.fullName],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            Import from GitHub
          </DialogTitle>
          <DialogDescription>
            {step === "username" &&
              "Pull your public repos and turn selected ones into Project entries."}
            {step === "repos" &&
              "Pick the repos you want to import — AI will draft a project entry for each."}
            {step === "review" &&
              "Review each generated project. Edit anything before accepting — nothing is added until you do."}
          </DialogDescription>
        </DialogHeader>

        {step === "username" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="GitHub username"
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchRepos();
                }}
                disabled={isFetchingRepos}
              />
              <Button
                onClick={() => fetchRepos()}
                disabled={!username.trim() || isFetchingRepos}
              >
                {isFetchingRepos ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Fetch Repos
              </Button>
            </div>
            {fetchError && (
              <div className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {fetchError}
              </div>
            )}
          </div>
        )}

        {step === "repos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("username")}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer border-none bg-transparent p-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change username
              </button>
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeForks}
                  onChange={(e) => toggleForks(e.target.checked)}
                  className="cursor-pointer"
                />
                Show forks
              </label>
            </div>

            {isFetchingRepos ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : repos.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">
                No public repositories found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {repos.map((repo) => {
                  const checked = selectedRepos.has(repo.fullName);
                  return (
                    <label
                      key={repo.fullName}
                      className={`flex flex-col gap-1.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(repo.fullName)}
                            className="shrink-0 cursor-pointer"
                          />
                          <span className="font-medium text-sm text-gray-900 truncate">
                            {repo.name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                          <Star className="w-3 h-3" />
                          {repo.stargazersCount}
                        </span>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        {repo.language && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {repo.language}
                          </Badge>
                        )}
                        <span className="text-[10px] text-gray-400">
                          Updated {new Date(repo.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <Button
              onClick={handleImportSelected}
              disabled={selectedRepos.size === 0}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Import Selected ({selectedRepos.size})
            </Button>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("repos")}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer border-none bg-transparent p-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to repo list
            </button>

            {reviewTargets.map((repo) => {
              const state = genState[repo.fullName];
              const edited = editedFields[repo.fullName];

              if (state.accepted) {
                return (
                  <div
                    key={repo.fullName}
                    className="flex items-center gap-2 p-3 rounded-lg border border-green-200 bg-green-50 text-sm text-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    &ldquo;{edited?.projectName}&rdquo; added to Projects
                  </div>
                );
              }

              if (state.status === "loading") {
                return (
                  <div
                    key={repo.fullName}
                    className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
                  >
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Generating project from {repo.name}...
                  </div>
                );
              }

              if (state.status === "error") {
                return (
                  <div
                    key={repo.fullName}
                    className="p-4 rounded-lg border border-red-200 bg-red-50 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {repo.name}: {state.error}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runGeneration(repo)}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Retry
                    </Button>
                  </div>
                );
              }

              if (!edited) return null;

              return (
                <div
                  key={repo.fullName}
                  className="p-4 rounded-lg border border-gray-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      from {repo.fullName}
                    </span>
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                    >
                      View on GitHub
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <Input
                    value={edited.projectName}
                    onChange={(e) =>
                      setEditedFields((prev) => ({
                        ...prev,
                        [repo.fullName]: {
                          ...edited,
                          projectName: e.target.value,
                        },
                      }))
                    }
                    className="font-semibold"
                  />
                  <Textarea
                    value={edited.description}
                    onChange={(e) =>
                      setEditedFields((prev) => ({
                        ...prev,
                        [repo.fullName]: {
                          ...edited,
                          description: e.target.value,
                        },
                      }))
                    }
                    rows={2}
                    className="text-sm resize-none"
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Highlights
                    </label>
                    {edited.highlights.map((h, i) => (
                      <Input
                        key={i}
                        value={h}
                        onChange={(e) => {
                          const nextHighlights = [...edited.highlights];
                          nextHighlights[i] = e.target.value;
                          setEditedFields((prev) => ({
                            ...prev,
                            [repo.fullName]: {
                              ...edited,
                              highlights: nextHighlights,
                            },
                          }));
                        }}
                        className="text-sm"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Tech Stack
                    </label>
                    <Input
                      value={edited.techStack.join(", ")}
                      onChange={(e) =>
                        setEditedFields((prev) => ({
                          ...prev,
                          [repo.fullName]: {
                            ...edited,
                            techStack: e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          },
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDiscard(repo.fullName)}
                    >
                      Discard
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccept(repo.fullName)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
