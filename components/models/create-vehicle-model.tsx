"use client";

import { useEffect, useMemo, useState } from "react";
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
  createVehicleFormSchema,
  type CreateVehicleFormSchema,
  type VehicleCategory,
} from "@/lib/schemas";
import { useCreateVehicle } from "@/hooks/queries/use-vehicles";
import { useUpload } from "@/hooks/queries/use-upload";

const defaultValues: CreateVehicleFormSchema = {
  categoryId: "",
  registrationNumber: "",
  make: "",
  model: "",
  year: undefined,
  color: "",
  passengerCapacity: 4,
  luggageCapacity: 2,
  status: "active",
  notes: "",
  image: null,
};

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

export type CreateVehicleModelProps = {
  open: boolean;
  onClose: () => void;
  categories: VehicleCategory[];
};

const CreateVehicleModel = ({ open, onClose, categories }: CreateVehicleModelProps) => {
  const { mutateAsync: createVehicle, isPending } = useCreateVehicle();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const isBusy = isPending || isUploading;

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

  const form = useForm<CreateVehicleFormSchema>({
    resolver: zodResolver(createVehicleFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
      return;
    }

    if (categoryOptions.length === 1) {
      form.setValue("categoryId", categoryOptions[0].value);
    }
  }, [open, form, categoryOptions]);

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const onSubmit = async (values: CreateVehicleFormSchema) => {
    const { image, ...rest } = values;
    let imageUrl: string | undefined;

    if (image instanceof File) {
      const uploaded = await uploadImage({ file: image, folder: "vehicles" });
      imageUrl = uploaded.url;
    }

    await createVehicle({
      ...rest,
      image: imageUrl,
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
          <DialogTitle>Add vehicle</DialogTitle>
          <DialogDescription>
            Register a vehicle in your fleet with its category and capacity details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="categoryId"
                type="select"
                label="Category"
                options={categoryOptions}
                placeholder="Select category"
              />
              <Input name="registrationNumber" label="Registration number" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="make" label="Make" />
              <Input name="model" label="Model" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="year" type="number" label="Year (optional)" />
              <Input name="color" label="Color (optional)" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="passengerCapacity" type="number" label="Passengers" />
              <Input name="luggageCapacity" type="number" label="Luggage" />
            </div>

            <Input name="status" type="select" label="Status" options={statusOptions} />

            <Input
              name="image"
              type="file"
              label="Vehicle image"
              accept="image/*"
              uploadCompact
              uploadDescription="Drag and drop or click to upload a vehicle photo"
            />

            <Input name="notes" type="textarea" label="Notes (optional)" />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                color="secondary"
                onClick={handleClose}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isBusy} loadingText="Adding...">
                Add vehicle
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVehicleModel;
