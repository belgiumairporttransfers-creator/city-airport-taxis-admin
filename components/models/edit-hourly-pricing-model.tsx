"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  toHourlyPricingFormValues,
  toHourlyPricingPayload,
  updateHourlyPricingFormSchema,
  type HourlyPricing,
  type UpdateHourlyPricingFormSchema,
} from "@/lib/schemas";
import { useUpdateHourlyPricing } from "@/hooks/queries/use-hourly-pricing";
import { DISTANCE_LABEL } from "@/lib/utils";

const DURATION_LABEL = "hrs";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export type EditHourlyPricingModelProps = {
  open: boolean;
  pricing: HourlyPricing | null;
  onClose: () => void;
};

const EditHourlyPricingModel = ({ open, pricing, onClose }: EditHourlyPricingModelProps) => {
  const { mutateAsync: updatePricing, isPending } = useUpdateHourlyPricing();

  const form = useForm<UpdateHourlyPricingFormSchema>({
    resolver: zodResolver(updateHourlyPricingFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!open || !pricing) return;
    form.reset(toHourlyPricingFormValues(pricing));
  }, [open, pricing, form]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = async (values: UpdateHourlyPricingFormSchema) => {
    if (!pricing) return;

    await updatePricing({
      id: pricing._id,
      payload: toHourlyPricingPayload(values),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Edit hourly pricing</DialogTitle>
          <DialogDescription>
            Update duration and fare rules for this category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="duration"
                type="number"
                label={`Duration (${DURATION_LABEL})`}
                min={1}
                step="1"
              />
              <Input name="price" type="number" label="Price" min={0} step="0.01" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="includedDistance"
                type="number"
                label={`Included distance (${DISTANCE_LABEL})`}
                min={0}
                step="0.1"
              />
              <Input
                name="extraDistancePrice"
                type="number"
                label={`Extra distance price (per ${DISTANCE_LABEL})`}
                min={0}
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="sortOrder" type="number" label="Sort order" />
              <Input name="status" type="select" label="Status" options={statusOptions} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isPending} loadingText="Saving...">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHourlyPricingModel;
