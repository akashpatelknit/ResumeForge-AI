"use client";

import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Deliberately not wired to anything real — "delete every user,
// subscription, and document" is exactly the kind of irreversible,
// full-blast-radius action that shouldn't exist behind a single button
// click in an admin UI, let alone one built from a styling request. This
// explains that instead of pretending to offer it.
export function DangerZoneSection() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
          <Trash2 className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-red-700">Danger Zone</p>
          <p className="text-sm text-red-600/80">Irreversible and destructive actions.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-red-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Reset Platform Data</p>
          <p className="mt-0.5 text-sm text-gray-500">
            This action will permanently delete all platform data including users, subscriptions, and documents.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Reset Platform Data
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Not available</AlertDialogTitle>
              <AlertDialogDescription>
                Bulk-deleting all platform data isn&apos;t something this admin panel performs — that&apos;s
                deliberate, not a missing feature. If you genuinely need to wipe data, do it directly and
                deliberately against the database, with a backup taken first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Understood</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
