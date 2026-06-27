import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

type FormInfoNoteProps = {
  children: ReactNode;
  className?: string;
};

const FormInfoNote = ({ children, className }: FormInfoNoteProps) => {
  return (
    <div className={cn("mb-6 flex items-start gap-2.5", className)}>
      <Icon
        icon="heroicons:information-circle"
        className="mt-0.5 h-4 w-4 shrink-0 text-default-400"
      />
      <p className="text-sm leading-relaxed text-default-500">{children}</p>
    </div>
  );
};

export default FormInfoNote;
