"use client";

import { FileUpload } from "@/components/file-upload/file-upload";
import { useState } from "react";

const MultipleFileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FileUpload
      multiple
      value={files}
      onChange={(value) => setFiles((value as File[]) ?? [])}
      description="Drop files here or click to upload."
    />
  );
};

export default MultipleFileUploader;
