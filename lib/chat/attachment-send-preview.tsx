"use client";

import { FileText, SendHorizontal, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileExtension } from "@/lib/chat/format-file-size";
import { cn } from "@/lib/utils";

export type PendingAttachment = {
  file: File;
  previewUrl: string;
  kind: "image" | "document";
};

interface AttachmentSendPreviewProps {
  pending: PendingAttachment | null;
  isSending?: boolean;
  onClose: () => void;
  onSend: () => void;
}

export function AttachmentSendPreview({
  pending,
  isSending = false,
  onClose,
  onSend,
}: AttachmentSendPreviewProps) {
  if (!pending) return null;

  const extension = getFileExtension(pending.file.name, pending.file.type);
  const sizeLabel = formatFileSize(pending.file.size);
  const isImage = pending.kind === "image";

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSending) onClose();
      }}
    >
      <DialogContent
        size="full"
        showCloseButton={false}
        className="flex h-screen max-h-screen flex-col border-0 bg-black/95 p-0 shadow-none"
      >
        <DialogTitle className="sr-only">{pending.file.name}</DialogTitle>

        <div className="flex items-center justify-between px-4 py-3 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10 disabled:opacity-50"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="max-w-[70%] truncate text-sm font-medium">
            {pending.file.name}
          </p>
          <span className="h-9 w-9" />
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          {isImage ? (
            <img
              src={pending.previewUrl}
              alt={pending.file.name}
              className="max-h-[calc(100vh-10rem)] max-w-full object-contain"
            />
          ) : (
            <div className="w-full max-w-sm rounded-xl bg-default-900/80 p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-default-800">
                <FileText className="h-10 w-10 text-default-300" strokeWidth={1.5} />
              </div>
              <p className="mt-5 truncate text-sm font-medium text-white">
                {pending.file.name}
              </p>
              <p className="mt-2 text-sm text-default-400">No preview available</p>
              <p className="mt-1 text-sm text-default-500">
                {sizeLabel} · {extension}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSending}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSend}
            disabled={isSending}
            className={cn(
              "h-10 min-w-24 gap-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isSending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                <SendHorizontal className="h-4 w-4 rtl:rotate-180" />
                Send
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
