import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
  className,
}: SettingsSectionProps) => (
  <section className={cn("space-y-3", className)}>
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-default-50 text-default-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-default-900">{title}</h3>
        <p className="text-xs text-default-500">{description}</p>
      </div>
    </div>
    <div className="rounded-lg border border-border bg-card px-4 py-1">{children}</div>
  </section>
);

export default SettingsSection;
