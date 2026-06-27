"use client";

import { FileUpload } from "@/components/file-upload/file-upload";
import { useState } from "react";

const SingleFileUploader = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <FileUpload
      value={file}
      onChange={(value) => setFile(Array.isArray(value) ? (value[0] ?? null) : value)}
      accept={{
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      }}
      description="Drop a file here or click to upload."
    />
  );
};

export default SingleFileUploader;
