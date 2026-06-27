"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ConfirmationDialog from "@/components/confirmation-dialog";
import {
  useApproveDriverApplication,
  useRejectDriverApplication,
  useRequestDriverChanges,
  useStartDriverReview,
  useSuspendDriverApplication,
} from "@/hooks/queries/use-drivers";
import type { DriverApplication, DriverApplicationStatus } from "@/lib/schemas";
import { Loader2 } from "lucide-react";

type DriverProfileActionsProps = {
  driver: DriverApplication;
};

type NotesAction = "reject" | "request-changes" | "suspend";

const DriverProfileActions = ({ driver }: DriverProfileActionsProps) => {
  const [confirmAction, setConfirmAction] = useState<"start-review" | "approve" | null>(null);
  const [notesAction, setNotesAction] = useState<NotesAction | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const startReview = useStartDriverReview(driver.id);
  const approve = useApproveDriverApplication(driver.id);
  const reject = useRejectDriverApplication(driver.id);
  const requestChanges = useRequestDriverChanges(driver.id);
  const suspend = useSuspendDriverApplication(driver.id);

  const isPending =
    startReview.isPending ||
    approve.isPending ||
    reject.isPending ||
    requestChanges.isPending ||
    suspend.isPending;

  const resetNotesDialog = () => {
    setNotesAction(null);
    setReviewNotes("");
  };

  const handleNotesSubmit = async () => {
    const trimmedNotes = reviewNotes.trim();

    if (notesAction === "reject" || notesAction === "request-changes") {
      if (!trimmedNotes) return;
    }

    if (notesAction === "reject") {
      await reject.mutateAsync(trimmedNotes);
    } else if (notesAction === "request-changes") {
      await requestChanges.mutateAsync(trimmedNotes);
    } else if (notesAction === "suspend") {
      await suspend.mutateAsync(trimmedNotes || undefined);
    }

    resetNotesDialog();
  };

  const actionsByStatus: Record<DriverApplicationStatus, React.ReactNode> = {
    pending: (
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => setConfirmAction("start-review")}
      >
        Start Review
      </Button>
    ),
    under_review: (
      <>
        <Button
          size="sm"
          color="success"
          disabled={isPending}
          onClick={() => setConfirmAction("approve")}
        >
          Approve
        </Button>
        <Button
          size="sm"
          color="destructive"
          disabled={isPending}
          onClick={() => setNotesAction("reject")}
        >
          Reject
        </Button>
        <Button
          size="sm"
          color="warning"
          disabled={isPending}
          onClick={() => setNotesAction("request-changes")}
        >
          Request Changes
        </Button>
      </>
    ),
    changes_requested: (
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => setConfirmAction("start-review")}
      >
        Start Review
      </Button>
    ),
    approved: (
      <Button
        size="sm"
        color="destructive"
        disabled={isPending}
        onClick={() => setNotesAction("suspend")}
      >
        Suspend
      </Button>
    ),
    rejected: null,
    suspended: null,
  };

  const visibleActions = actionsByStatus[driver.status];

  if (!visibleActions) {
    return null;
  }

  const notesDialogCopy: Record<
    NotesAction,
    { title: string; description: string; confirmLabel: string; required: boolean }
  > = {
    reject: {
      title: "Reject Application",
      description: "Provide a reason for rejecting this driver application. The driver will receive this message by email.",
      confirmLabel: "Reject Application",
      required: true,
    },
    "request-changes": {
      title: "Request Changes",
      description: "Tell the driver what needs to be updated before approval. This message will be sent by email.",
      confirmLabel: "Send Request",
      required: true,
    },
    suspend: {
      title: "Suspend Driver",
      description: "Optionally add a reason for suspending this approved driver. Leave blank if no note is required.",
      confirmLabel: "Suspend Driver",
      required: false,
    },
  };

  const activeNotesDialog = notesAction ? notesDialogCopy[notesAction] : null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {visibleActions}
      </div>

      <ConfirmationDialog
        open={confirmAction === "start-review"}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          await startReview.mutateAsync();
        }}
        title="Start Review"
        description={`Move ${driver.firstName} ${driver.lastName}'s application to under review? The driver will be notified by email.`}
        confirmLabel="Start Review"
        pendingLabel="Starting..."
      />

      <ConfirmationDialog
        open={confirmAction === "approve"}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          await approve.mutateAsync();
        }}
        title="Approve Driver"
        description={`Approve ${driver.firstName} ${driver.lastName} and create their driver account? A password setup email will be sent.`}
        confirmLabel="Approve"
        pendingLabel="Approving..."
      />

      <Dialog
        open={Boolean(notesAction)}
        onOpenChange={(open) => {
          if (!open) resetNotesDialog();
        }}
      >
        <DialogContent size="md">
          {activeNotesDialog ? (
            <>
              <DialogHeader>
                <DialogTitle>{activeNotesDialog.title}</DialogTitle>
                <DialogDescription>{activeNotesDialog.description}</DialogDescription>
              </DialogHeader>
              <Textarea
                value={reviewNotes}
                onChange={(event) => setReviewNotes(event.target.value)}
                placeholder="Enter review notes..."
                rows={5}
              />
              <DialogFooter>
                <Button variant="outline" onClick={resetNotesDialog}>
                  Cancel
                </Button>
                <Button
                  color={notesAction === "suspend" ? "destructive" : "primary"}
                  disabled={
                    isPending ||
                    (activeNotesDialog.required && !reviewNotes.trim())
                  }
                  onClick={handleNotesSubmit}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {activeNotesDialog.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DriverProfileActions;
