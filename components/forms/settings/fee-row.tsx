import { Input } from "@/components/ui/input";
import type { SiteSettingsFormSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type FeeRowProps = {
  name: keyof SiteSettingsFormSchema;
  title: string;
  description: string;
  label: string;
  variant?: "row" | "card";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
};

const FeeRow = ({
  name,
  title,
  description,
  label,
  variant = "row",
  min = 0,
  max,
  step = 0.01,
  placeholder = "0.00",
  className,
}: FeeRowProps) => {
  const input = (
    <Input
      name={name}
      type="number"
      label={label}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={cn(variant === "row" ? "w-full sm:w-[7.5rem] shrink-0" : "w-full", className)}
      inputClassName="h-9 text-sm tabular-nums text-right"
    />
  );

  if (variant === "card") {
    return (
      <div className="flex h-full flex-col justify-between gap-3 rounded-md border border-border p-3.5">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-default-900">{title}</p>
          <p className="text-xs leading-snug text-default-500">{description}</p>
        </div>
        {input}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-default-900">{title}</p>
        <p className="mt-0.5 text-xs leading-snug text-default-500">{description}</p>
      </div>
      {input}
    </div>
  );
};

export default FeeRow;
