"use client";

import { useEffect, useMemo } from "react";
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
  createHourlyPricingFormSchema,
  toHourlyPricingPayload,
  type CreateHourlyPricingFormSchema,
  type VehicleCategory,
} from "@/lib/schemas";
import { useCreateHourlyPricing } from "@/hooks/queries/use-hourly-pricing";
import { DISTANCE_LABEL } from "@/lib/utils";

const DURATION_LABEL = "hrs";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const defaultValues: CreateHourlyPricingFormSchema = {
  categoryId: "",
  serviceType: "hourly",
  duration: 4,
  price: 0,
  includedDistance: 0,
  extraDistancePrice: 0,
  status: "active",
  sortOrder: 0,
};

export type CreateHourlyPricingModelProps = {
  open: boolean;
  onClose: () => void;
  categories: VehicleCategory[];
  defaultCategoryId?: string;
};

const CreateHourlyPricingModel = ({
  open,
  onClose,
  categories,
  defaultCategoryId,
}: CreateHourlyPricingModelProps) => {
  const { mutateAsync: createPricing, isPending } = useCreateHourlyPricing();

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.status === "active")
        .map((category) => ({
          label: category.name,
          value: category._id,
        })),
    [categories]
  );

  const form = useForm<CreateHourlyPricingFormSchema>({
    resolver: zodResolver(createHourlyPricingFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      return;
    }

    if (defaultCategoryId) {
      form.setValue("categoryId", defaultCategoryId);
    } else if (categoryOptions.length === 1) {
      form.setValue("categoryId", categoryOptions[0].value);
    }
  }, [open, form, defaultCategoryId, categoryOptions]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const onSubmit = async (values: CreateHourlyPricingFormSchema) => {
    await createPricing({
      categoryId: values.categoryId,
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
          <DialogTitle>Add hourly pricing</DialogTitle>
          <DialogDescription>
            Define duration-based fare rules for a vehicle category.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input
              name="categoryId"
              type="select"
              label="Fleet"
              options={categoryOptions}
              placeholder="Select category"
            />

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
              <Button type="submit" isLoading={isPending} loadingText="Creating...">
                Create hourly pricing
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHourlyPricingModel;
