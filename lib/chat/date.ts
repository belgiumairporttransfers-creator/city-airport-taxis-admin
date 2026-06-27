import { format, isToday, isYesterday } from "date-fns";

export const getChatDateKey = (value: string | Date): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
};

export const formatChatDateLabel = (value: string | Date): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "MMMM d, yyyy");
};

export const shouldShowChatDateSeparator = (
  currentTime: string,
  previousTime?: string
): boolean => {
  if (!previousTime) return true;
  return getChatDateKey(currentTime) !== getChatDateKey(previousTime);
};
