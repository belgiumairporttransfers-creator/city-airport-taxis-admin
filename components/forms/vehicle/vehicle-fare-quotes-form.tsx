"use client";

import { useEffect } from "react";
import { useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  vehicleFareQuotesSearchSchema,
  type VehicleFareQuotesSearchSchema,
} from "@/lib/schemas";

const defaultValues = {
  distance: undefined,
} satisfies DefaultValues<VehicleFareQuotesSearchSchema>;

export type VehicleFareQuotesFormProps = {
  defaultDistance?: string | null;
  onSubmit: (distance: number) => void;
  isLoading?: boolean;
};

const VehicleFareQuotesForm = ({
  defaultDistance,
  onSubmit,
  isLoading = false,
}: VehicleFareQuotesFormProps) => {
  const form = useForm<VehicleFareQuotesSearchSchema>({
    resolver: zodResolver(vehicleFareQuotesSearchSchema),
    mode: "onSubmit",
    defaultValues,
  });

  useEffect(() => {
    if (!defaultDistance) {
      form.reset(defaultValues);
      return;
    }

    const parsed = Number(defaultDistance);
    if (!Number.isFinite(parsed) || parsed < 0) {
      form.reset(defaultValues);
      return;
    }

    form.reset({ distance: parsed });
  }, [defaultDistance, form]);

  const handleSubmit = (values: VehicleFareQuotesSearchSchema) => {
    onSubmit(values.distance);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="w-full sm:max-w-xs">
          <Input
            name="distance"
            type="number"
            label="Distance (km)"
            min={0}
            step="0.1"
          />
        </div>
        <Button
          size="xl"
          type="submit"
          isLoading={isLoading}
          loadingText="Checking..."
        >
          <Search className="mr-2 h-4 w-4" />
          Check prices
        </Button>
      </form>
    </Form>
  );
};

export default VehicleFareQuotesForm;
