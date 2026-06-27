export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function getFileExtension(filename: string, mimeType?: string): string {
  const fromName = filename.split(".").pop()?.toUpperCase();
  if (fromName && fromName.length <= 6) return fromName;
  const fromMime = mimeType?.split("/").pop()?.toUpperCase();
  return fromMime ?? "FILE";
}
