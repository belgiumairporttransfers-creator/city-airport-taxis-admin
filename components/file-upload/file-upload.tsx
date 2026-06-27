"use client";

import * as React from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Upload } from "lucide-react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number) {
  const kb = Math.round(bytes / 100) / 10;
  return kb > 1000 ? `${(kb / 1000).toFixed(1)} mb` : `${kb.toFixed(1)} kb`;
}

function FilePreview({ file }: { file: File }) {
  const previewUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

  React.useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (file.type.startsWith("image/")) {
    return (
      <Image
        width={48}
        height={48}
        unoptimized
        alt={file.name}
        src={previewUrl}
        className="rounded border border-border p-0.5"
      />
    );
  }

  return <Icon icon="tabler:file-description" className="h-12 w-12 text-default-500" />;
}

export interface FileUploadProps {
  value?: File | File[] | null;
  onChange: (value: File | File[] | null) => void;
  multiple?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  accept?: Accept;
  className?: string;
  description?: string;
  compact?: boolean;
  existingImageUrl?: string | null;
  onClearExistingImage?: () => void;
}

export function FileUpload({
  value,
  onChange,
  multiple = false,
  disabled = false,
  hasError = false,
  accept,
  className,
  description = "Drop files here or click to upload.",
  compact = false,
  existingImageUrl,
  onClearExistingImage,
}: FileUploadProps) {
  const files = React.useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const { getRootProps, getInputProps } = useDropzone({
    multiple,
    accept,
    disabled,
    onDrop: (acceptedFiles) => {
      if (multiple) {
        onChange(acceptedFiles);
        return;
      }
      onChange(acceptedFiles[0] ?? null);
    },
  });

  const removeFile = (file: File) => {
    if (multiple) {
      onChange(files.filter((item) => item.name !== file.name));
      return;
    }
    onChange(null);
  };

  const clearAll = () => {
    onChange(multiple ? [] : null);
    if (existingImageUrl) {
      onClearExistingImage?.();
    }
  };

  const singleImagePreview =
    !multiple && files[0]?.type.startsWith("image/") ? files[0] : null;

  const singleImagePreviewUrl = React.useMemo(() => {
    if (!singleImagePreview) return null;
    return URL.createObjectURL(singleImagePreview);
  }, [singleImagePreview]);

  const showExistingImage = !singleImagePreview && Boolean(existingImageUrl);
  const previewUrl = singleImagePreviewUrl ?? (showExistingImage ? existingImageUrl : null);
  const previewAlt = singleImagePreview?.name ?? "Saved cover image";

  React.useEffect(() => {
    return () => {
      if (singleImagePreviewUrl) {
        URL.revokeObjectURL(singleImagePreviewUrl);
      }
    };
  }, [singleImagePreviewUrl]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {previewUrl ? (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            compact ? "h-[180px]" : "h-[300px]"
          )}
        >
          <Button
            type="button"
            className="absolute top-4 right-4 z-20 h-12 w-12 rounded-full bg-default-900 hover:bg-background hover:text-default-900"
            onClick={clearAll}
            disabled={disabled}
          >
            <Icon icon="fa6-solid:xmark" className="text-xl" />
          </Button>
          <Image
            alt={previewAlt}
            className="rounded-md object-cover"
            src={previewUrl}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : (
        <div
          {...getRootProps({
            className: cn(
              "w-full cursor-pointer rounded-md border border-dashed border-default-300 bg-muted/20 text-center transition duration-300 hover:border-primary/40 hover:bg-muted/40",
              compact ? "py-8" : "py-[52px]",
              hasError && "border-destructive",
              disabled && "cursor-not-allowed opacity-50"
            ),
          })}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className={cn("text-primary", compact ? "h-6 w-6" : "h-7 w-7")} />
            </div>
            <p
              className={cn(
                "max-w-sm px-4 font-medium text-default-600",
                compact ? "text-sm" : "text-base 2xl:text-lg"
              )}
            >
              {description}
            </p>
            <p className="mt-1 text-xs text-default-400">PNG, JPG or WEBP</p>
          </div>
        </div>
      )}

      {files.length > 0 && !singleImagePreview && (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.lastModified}`}
              className="flex items-center justify-between rounded-md border border-border px-3.5 py-3"
            >
              <div className="flex items-center gap-3">
                <FilePreview file={file} />
                <div>
                  <div className="text-sm text-card-foreground">{file.name}</div>
                  <div className="text-xs font-light text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                color="destructive"
                variant="outline"
                className="rounded-full border-none"
                onClick={() => removeFile(file)}
                disabled={disabled}
              >
                <Icon icon="tabler:x" className="h-5 w-5" />
              </Button>
            </div>
          ))}

          {multiple && files.length > 1 && (
            <div className="flex justify-end">
              <Button
                type="button"
                color="destructive"
                onClick={clearAll}
                disabled={disabled}
              >
                Remove All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
