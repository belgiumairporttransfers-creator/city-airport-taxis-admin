"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MessageAttachment } from "@/lib/schemas/communication";

interface ImageMessagePreviewProps {
  attachment: MessageAttachment;
  className?: string;
}

export function ImageMessagePreview({
  attachment,
  className,
}: ImageMessagePreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className ?? ""}`}
      >
        <img
          src={attachment.url}
          alt={attachment.filename}
          className="max-h-[320px] max-w-[min(280px,70vw)] cursor-pointer object-cover"
          loading="lazy"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          size="full"
          showCloseButton={false}
          className="flex h-screen max-h-screen flex-col border-0 bg-black/95 p-0 shadow-none"
        >
          <DialogTitle className="sr-only">{attachment.filename}</DialogTitle>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="max-w-[70%] truncate text-sm font-medium">
              {attachment.filename}
            </p>
            <span className="h-9 w-9" />
          </div>
          <div className="flex flex-1 items-center justify-center px-4 pb-8">
            <img
              src={attachment.url}
              alt={attachment.filename}
              className="max-h-[calc(100vh-6rem)] max-w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
