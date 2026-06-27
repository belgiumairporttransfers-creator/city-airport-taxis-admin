"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  toPricingFormValues,
  toPricingPayload,
  updateVehiclePricingFormSchema,
  type UpdateVehiclePricingFormSchema,
  type VehiclePricing,
} from "@/lib/schemas";
import { useUpdateVehiclePricing, useVehicleCategoryPricing } from "@/hooks/queries/use-vehicle-pricing";
import { validateSlabRange } from "@/lib/vehicle-pricing-range";

const pricingTypeOptions = [
  { label: "Fixed fare", value: "fixed" },
  { label: "Per km", value: "per_unit" },
  { label: "Base + per km", value: "base_plus_per_unit" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export type EditVehiclePricingModelProps = {
  open: boolean;
  slab: VehiclePricing | null;
  onClose: () => void;
};

const EditVehiclePricingModel = ({ open, slab, onClose }: EditVehiclePricingModelProps) => {
  const { mutateAsync: updatePricing, isPending } = useUpdateVehiclePricing();

  const form = useForm<UpdateVehiclePricingFormSchema>({
    resolver: zodResolver(updateVehiclePricingFormSchema),
    mode: "onChange",
  });

  const pricingType = useWatch({ control: form.control, name: "pricingType" });
  const openEnded = useWatch({ control: form.control, name: "openEnded" });
  const minDistance = useWatch({ control: form.control, name: "minDistance" });

  const { data: existingSlabs = [] } = useVehicleCategoryPricing(slab?.categoryId ?? "", open && !!slab);

  useEffect(() => {
    if (pricingType !== "base_plus_per_unit") {
      form.setValue("perKmRate", undefined);
    }
  }, [pricingType, form]);

  useEffect(() => {
    if (openEnded) {
      form.setValue("maxDistance", undefined);
      form.clearErrors("maxDistance");
    }
  }, [openEnded, form]);

  useEffect(() => {
    if (!open || !slab) return;
    form.reset(toPricingFormValues(slab));
  }, [open, slab, form]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = async (values: UpdateVehiclePricingFormSchema) => {
    if (!slab) return;

    const rangeError = validateSlabRange({
      minDistance: values.minDistance,
      maxDistance: values.maxDistance,
      openEnded: values.openEnded,
      existingSlabs,
      excludeSlabId: slab._id,
    });

    if (rangeError) {
      form.setError(rangeError.field, { message: rangeError.message });
      return;
    }

    await updatePricing({
      id: slab._id,
      payload: toPricingPayload(values),
    });
    onClose();
  };

  const maxDistanceMin =
    Number.isFinite(minDistance) && minDistance >= 0 ? minDistance + 0.1 : 0.1;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Edit pricing slab</DialogTitle>
          <DialogDescription>
            Update distance range and fare rules for this category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="minDistance"
                type="number"
                label="Minimum distance (km)"
                min={0}
                step="0.1"
              />
              {!openEnded ? (
                <Input
                  name="maxDistance"
                  type="number"
                  label="Maximum distance (km)"
                  min={maxDistanceMin}
                  step="0.1"
                />
              ) : (
                <div className="flex items-end rounded-md border border-border px-4 py-3 text-sm text-default-600">
                  No upper limit (open-ended slab)
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-default-900">Open-ended slab</p>
                <p className="mt-0.5 text-xs text-default-500">
                  Applies from the minimum distance with no upper limit.
                </p>
              </div>
              <Input name="openEnded" type="switch" switchSize="md" className="shrink-0" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="pricingType"
                type="select"
                label="Pricing type"
                options={pricingTypeOptions}
              />
              <Input name="priceAmount" type="number" label="Price amount" min={0} step="0.01" />
            </div>

            {pricingType === "base_plus_per_unit" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  name="perKmRate"
                  type="number"
                  label="Per km rate"
                  min={0}
                  step="0.01"
                />
                <Input
                  name="increasePercentage"
                  type="number"
                  label="Adjustment %"
                  min={-100}
                  max={100}
                  step="0.01"
                />
              </div>
            ) : (
              <Input
                name="increasePercentage"
                type="number"
                label="Adjustment %"
                min={-100}
                max={100}
                step="0.01"
              />
            )}

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

export default EditVehiclePricingModel;
