import { Input } from "@/components/ui/input";

type ToggleRowProps = {
  title: string;
  description: string;
  name: "maintenanceMode" | "comingSoonMode" | "livePaymentMode";
};

const ToggleRow = ({ title, description, name }: ToggleRowProps) => (
  <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
    <div className="min-w-0 pr-4">
      <p className="text-sm font-medium text-default-900">{title}</p>
      <p className="mt-0.5 text-xs leading-snug text-default-500">{description}</p>
    </div>
    <Input name={name} type="switch" switchSize="md" className="shrink-0" />
  </div>
);

export default ToggleRow;
