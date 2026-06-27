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
  updateVehicleFormSchema,
  type UpdateVehicleFormSchema,
  type Vehicle,
  type VehicleCategory,
} from "@/lib/schemas";
import { useUpdateVehicle } from "@/hooks/queries/use-vehicles";
import { useUpload } from "@/hooks/queries/use-upload";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Inactive", value: "inactive" },
];

export type EditVehicleModelProps = {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
  categories: VehicleCategory[];
};

const EditVehicleModel = ({ open, vehicle, onClose, categories }: EditVehicleModelProps) => {
  const { mutateAsync: updateVehicle, isPending } = useUpdateVehicle();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const isBusy = isPending || isUploading;

  const categoryOptions = useMemo(() => {
    const options = categories
      .filter((category) => category.status === "active")
      .map((category) => ({
        label: category.name,
        value: category._id,
      }));

    if (vehicle && !options.some((option) => option.value === vehicle.categoryId)) {
      const currentCategory = categories.find((category) => category._id === vehicle.categoryId);
      if (currentCategory) {
        return [
          {
            label: `${currentCategory.name} (inactive)`,
            value: currentCategory._id,
          },
          ...options,
        ];
      }
    }

    return options;
  }, [categories, vehicle]);

  const form = useForm<UpdateVehicleFormSchema>({
    resolver: zodResolver(updateVehicleFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (open && vehicle) {
      form.reset({
        categoryId: vehicle.categoryId,
        registrationNumber: vehicle.registrationNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color ?? "",
        passengerCapacity: vehicle.passengerCapacity,
        luggageCapacity: vehicle.luggageCapacity,
        status: vehicle.status,
        notes: vehicle.notes ?? "",
        image: null,
      });
      setExistingImageUrl(vehicle.image ?? null);
    }
  }, [open, vehicle, form]);

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const onSubmit = async (values: UpdateVehicleFormSchema) => {
    if (!vehicle) return;

    const { image, ...rest } = values;
    let imageUrl = existingImageUrl ?? undefined;

    if (image instanceof File) {
      const uploaded = await uploadImage({ file: image, folder: "vehicles" });
      imageUrl = uploaded.url;
    }

    await updateVehicle({
      id: vehicle._id,
      payload: {
        ...rest,
        image: imageUrl ?? "",
      },
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
          <DialogTitle>Edit vehicle</DialogTitle>
          <DialogDescription>
            Update{" "}
            {vehicle
              ? `${vehicle.registrationNumber} — ${vehicle.make} ${vehicle.model}`
              : "this vehicle"}
            .
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
              existingImageUrl={existingImageUrl}
              onClearExistingImage={() => setExistingImageUrl(null)}
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
              <Button type="submit" isLoading={isBusy} loadingText="Saving...">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleModel;
