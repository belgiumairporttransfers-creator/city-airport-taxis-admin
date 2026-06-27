"use client";

import { FileText } from "lucide-react";
import type { MessageAttachment } from "@/lib/schemas/communication";
import { formatFileSize, getFileExtension } from "@/lib/chat/format-file-size";

interface DocumentMessagePreviewProps {
  attachment: MessageAttachment;
}

export function DocumentMessagePreview({
  attachment,
}: DocumentMessagePreviewProps) {
  const extension = getFileExtension(attachment.filename, attachment.mimeType);
  const sizeLabel = formatFileSize(attachment.size);

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block min-w-[220px] max-w-[280px] rounded-md bg-default-300/40 p-4 transition-colors hover:bg-default-300/60"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-default-400/30">
          <FileText className="h-8 w-8 text-default-700" strokeWidth={1.5} />
        </div>
        <div className="w-full space-y-1">
          <p className="truncate text-sm font-medium text-default-900">
            {attachment.filename}
          </p>
          <p className="text-xs text-default-500">No preview available</p>
          <p className="text-xs text-default-500">
            {sizeLabel} · {extension}
          </p>
        </div>
      </div>
    </a>
  );
}
