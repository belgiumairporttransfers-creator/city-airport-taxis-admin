"use client";

import * as React from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Eye, FileText, Loader2, Pencil, Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpload } from "@/hooks/queries/use-upload";
import toast from "react-hot-toast";

type UploadedKind = "image" | "pdf";

export interface InstantFileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  accept?: Accept;
  className?: string;
  description?: string;
  compact?: boolean;
  folder?: string;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

function isPdfUrl(url: string, kind: UploadedKind | null) {
  if (kind === "pdf") return true;
  return /\.pdf($|\?)/i.test(url);
}

export function InstantFileUpload({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  accept,
  className,
  description = "Drag and drop or click to upload",
  compact = false,
  folder = "driver-applications",
  onUploadStart,
  onUploadEnd,
}: InstantFileUploadProps) {
  const { mutateAsync: uploadFile, isPending } = useUpload();
  const [uploadedKind, setUploadedKind] = React.useState<UploadedKind | null>(null);
  const [fileName, setFileName] = React.useState("");

  const handleUpload = React.useCallback(
    async (file: File) => {
      setFileName(file.name);
      setUploadedKind(file.type === "application/pdf" ? "pdf" : "image");
      onUploadStart?.();

      try {
        const result = await uploadFile({ file, folder });
        onChange(result.url);
        toast.success("File uploaded successfully");
      } catch {
        setFileName("");
        setUploadedKind(null);
      } finally {
        onUploadEnd?.();
      }
    },
    [folder, onChange, onUploadEnd, onUploadStart, uploadFile]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    multiple: false,
    accept,
    disabled: disabled || isPending,
    noClick: Boolean(value),
    noKeyboard: Boolean(value),
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        void handleUpload(file);
      }
    },
  });

  const clearUpload = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    onChange("");
    setFileName("");
    setUploadedKind(null);
  };

  const showPdfPreview = Boolean(value) && isPdfUrl(value, uploadedKind);

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps({
          className: cn(
            "relative w-full overflow-hidden rounded-md border transition duration-300",
            value
              ? "border-success/30 bg-success/5 border-solid"
              : "border-dashed border-default-300 bg-muted/20 hover:border-primary/40 hover:bg-muted/40",
            compact ? "min-h-[180px]" : "min-h-[220px]",
            hasError && !value && "border-destructive",
            (disabled || isPending) && "cursor-not-allowed opacity-60"
          ),
        })}
      >
        <input {...getInputProps()} />

        {isPending ? (
          <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-default-600">Uploading {fileName}...</p>
          </div>
        ) : value ? (
          <div className="relative h-full min-h-[inherit]">
            <Button
              type="button"
              size="icon"
              color="destructive"
              className="absolute top-3 right-3 z-30 h-9 w-9 rounded-full"
              onClick={clearUpload}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>

            {showPdfPreview ? (
              <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 px-4 py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="line-clamp-2 px-4 text-center text-sm font-medium text-default-700">
                  {fileName || "PDF uploaded"}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    window.open(value, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View PDF
                </Button>
              </div>
            ) : (
              <div className="group relative h-full min-h-[inherit]">
                <Image
                  alt={fileName || "Uploaded preview"}
                  src={value}
                  fill
                  unoptimized
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white text-default-900 hover:bg-white"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(value, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={(event) => {
                      event.stopPropagation();
                      open();
                    }}
                    disabled={disabled}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-[inherit] cursor-pointer flex-col items-center justify-center px-4 py-8 text-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className={cn("text-primary", compact ? "h-6 w-6" : "h-7 w-7")} />
            </div>
            <p className="max-w-sm text-sm font-medium text-default-600 2xl:text-base">{description}</p>
            <p className="mt-1 text-xs text-default-400">PNG, JPG, WEBP or PDF</p>
          </div>
        )}
      </div>
    </div>
  );
}
