"use client";

import { ReactNode, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Status = "idle" | "loading" | "success" | "error";

// Shared "paste rough content -> Gemini -> preview -> accept" popover, used
// by every AI-assisted field in the builder (Professional Summary,
// per-Experience Key Achievements, per-Project Key Highlights, Custom
// Section entries). The result shape and accept behavior differ per field,
// so those are supplied as props (parseResult/renderPreview/onUse) rather
// than hardcoded — this component only owns the request lifecycle and the
// generate -> preview -> use-or-discard UX, never auto-overwrites anything.
interface GenerateWithAIProps<T> {
  endpoint: string;
  title: string;
  description: string;
  placeholder: string;
  // Builds the POST body from the pasted textarea content. Extra context
  // (role, company, existing field values, etc.) is closed over by the
  // caller, not threaded through this component's props.
  buildBody: (rawInput: string) => Record<string, unknown>;
  parseResult: (json: unknown) => T;
  renderPreview: (result: T) => ReactNode;
  // Second arg is the raw textarea content at the moment "Use this" was
  // clicked — empty string means the result came from regenerating
  // existing field content rather than fresh input, which callers that
  // support that mode (Achievements, Highlights, Custom Sections) use to
  // decide whether to replace existing content or append to it.
  onUse: (result: T, rawInput: string) => void;
  // Default: non-empty textarea required. Professional Summary overrides
  // this to also allow blank input when there's an existing summary to
  // regenerate from.
  isInputValid?: (rawInput: string) => boolean;
  emptyInputHint?: string;
  idleLabel?: string | ((rawInput: string) => string);
  triggerTitle?: string;
  popoverClassName?: string;
}

export default function GenerateWithAI<T>({
  endpoint,
  title,
  description,
  placeholder,
  buildBody,
  parseResult,
  renderPreview,
  onUse,
  isInputValid = (value) => !!value.trim(),
  emptyInputHint,
  idleLabel = "Generate",
  triggerTitle = "Generate with AI",
  popoverClassName = "w-80",
}: GenerateWithAIProps<T>) {
  const [open, setOpen] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputValid = isInputValid(rawInput);

  const handleGenerate = async () => {
    if (!inputValid || status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(rawInput)),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || "Failed to generate content");
      }

      setResult(parseResult(body));
      setStatus("success");
    } catch (error) {
      console.error(`Failed to generate via ${endpoint}:`, error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate content",
      );
      setStatus("error");
      // rawInput is intentionally left untouched here so the user doesn't
      // lose what they typed and can just hit Retry.
    }
  };

  const handleDiscard = () => {
    setResult(null);
    setStatus("idle");
  };

  const handleUse = () => {
    if (!result) return;
    onUse(result, rawInput);
    handleOpenChange(false);
  };

  // Reset after the close animation rather than immediately, so the
  // content doesn't visibly flash back to empty while the popover fades out.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setRawInput("");
        setStatus("idle");
        setResult(null);
        setErrorMessage(null);
      }, 200);
    }
  };

  const resolvedIdleLabel =
    typeof idleLabel === "function" ? idleLabel(rawInput) : idleLabel;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          title={triggerTitle}
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={popoverClassName} align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>

          {status !== "success" && (
            <>
              <Textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder={placeholder}
                rows={5}
                className="resize-none text-sm"
                disabled={status === "loading"}
              />

              {status === "error" && errorMessage && (
                <div className="flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {status !== "error" && !inputValid && emptyInputHint && (
                <p className="text-xs text-gray-400">{emptyInputHint}</p>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!inputValid || status === "loading"}
                size="sm"
                className="w-full"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : status === "error" ? (
                  "Retry"
                ) : (
                  resolvedIdleLabel
                )}
              </Button>
            </>
          )}

          {status === "success" && result && (
            <div className="space-y-3">
              {renderPreview(result)}
              <div className="flex gap-2">
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Discard
                </Button>
                <Button onClick={handleUse} size="sm" className="flex-1">
                  Use this
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
