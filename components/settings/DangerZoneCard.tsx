"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIRM_PHRASE = "DELETE";

// No account-deletion endpoint exists anywhere in the app yet (confirmed —
// no Clerk-side deletion call, no /api route, and no defined behavior for
// what happens to a deleted user's Resume/CoverLetter/Subscription/
// GmailAccount/etc rows). The confirmation flow below is real and complete;
// only the final action is a stand-in that explains that rather than
// silently doing nothing or pretending to succeed.
export default function DangerZoneCard() {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const canConfirm = confirmText === CONFIRM_PHRASE;

  function handleConfirmDelete() {
    toast.error(
      "Account deletion isn't wired up yet — it needs a real endpoint plus a decision on how to handle owned data (resumes, subscription, connected accounts).",
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-700">Delete Account</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
        </div>

        <AlertDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setConfirmText("");
          }}
        >
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your resumes, cover letters, subscription, and connected accounts. This
                cannot be undone. Type <span className="font-semibold text-foreground">{CONFIRM_PHRASE}</span> to
                confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-delete">Confirmation</Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
              />
            </div>

            <AlertDialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                disabled={!canConfirm}
                onClick={() => {
                  handleConfirmDelete();
                  setOpen(false);
                }}
              >
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
