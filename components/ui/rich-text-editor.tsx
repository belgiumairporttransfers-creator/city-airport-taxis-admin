"use client";

import * as React from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { cn } from "@/lib/utils";

const defaultToolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

const enterpriseToolbar = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  minHeight?: number;
  disabled?: boolean;
  hasError?: boolean;
  variant?: "default" | "enterprise";
}

export function RichTextEditor({
  value = "",
  onChange,
  onBlur,
  placeholder = "Write your message...",
  className,
  editorClassName,
  minHeight = 280,
  disabled = false,
  hasError = false,
  variant = "default",
}: RichTextEditorProps) {
  const modules = React.useMemo(
    () => ({
      toolbar: variant === "enterprise" ? enterpriseToolbar : defaultToolbar,
    }),
    [variant]
  );

  const { quill, quillRef } = useQuill({
    theme: "snow",
    placeholder,
    modules,
    readOnly: disabled,
  });

  const isSettingContent = React.useRef(false);
  const onBlurRef = React.useRef(onBlur);

  React.useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  React.useEffect(() => {
    if (!quill) return;

    const handleChange = () => {
      if (isSettingContent.current) return;
      onChange?.(quill.root.innerHTML);
    };

    const handleBlur = () => {
      onBlurRef.current?.();
    };

    quill.on("text-change", handleChange);
    quill.root.addEventListener("blur", handleBlur);

    return () => {
      quill.off("text-change", handleChange);
      quill.root.removeEventListener("blur", handleBlur);
    };
  }, [quill, onChange]);

  React.useEffect(() => {
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    const normalizedValue = value || "";

    if (normalizedValue !== currentHtml && normalizedValue !== "<p><br></p>") {
      isSettingContent.current = true;
      quill.root.innerHTML = normalizedValue;
      isSettingContent.current = false;
    }
  }, [quill, value]);

  React.useEffect(() => {
    if (!quill) return;
    quill.enable(!disabled);
  }, [disabled, quill]);

  return (
    <div
      className={cn(
        "rich-text-editor overflow-hidden rounded-md border border-default-300 bg-card",
        variant === "enterprise" && "rich-text-editor-enterprise",
        hasError && "border-destructive",
        disabled && "opacity-60",
        className
      )}
    >
      <div
        ref={quillRef}
        className={cn("bg-card", editorClassName)}
        style={{ minHeight }}
      />
    </div>
  );
}
