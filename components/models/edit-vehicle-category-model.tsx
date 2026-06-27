"use client";

import { useEffect, useState } from "react";
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
  updateVehicleCategoryFormSchema,
  type UpdateVehicleCategoryFormSchema,
  type UpdateVehicleCategoryPayload,
  type VehicleCategory,
} from "@/lib/schemas";
import { useUpdateVehicleCategory } from "@/hooks/queries/use-vehicle-categories";
import { useUpload } from "@/hooks/queries/use-upload";

const toFormValues = (category: VehicleCategory): UpdateVehicleCategoryFormSchema => ({
  name: category.name,
  description: category.description ?? "",
  passengerCapacity: category.passengerCapacity,
  luggageCapacity: category.luggageCapacity,
  handLuggageCapacity: category.handLuggageCapacity,
  sortOrder: category.sortOrder,
  status: category.status,
  isDefault: category.isDefault,
  image: null,
});

const toPayload = (
  values: UpdateVehicleCategoryFormSchema,
  imageUrl?: string
): UpdateVehicleCategoryPayload => ({
  name: values.name.trim(),
  description: values.description?.trim() || undefined,
  passengerCapacity: values.passengerCapacity,
  luggageCapacity: values.luggageCapacity,
  handLuggageCapacity: values.handLuggageCapacity,
  sortOrder: values.sortOrder,
  status: values.status,
  isDefault: values.isDefault,
  ...(imageUrl !== undefined ? { image: imageUrl } : {}),
});

export type EditVehicleCategoryModelProps = {
  open: boolean;
  category: VehicleCategory | null;
  onClose: () => void;
};

const EditVehicleCategoryModel = ({ open, category, onClose }: EditVehicleCategoryModelProps) => {
  const { mutateAsync: updateCategory, isPending } = useUpdateVehicleCategory();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const isBusy = isPending || isUploading;

  const form = useForm<UpdateVehicleCategoryFormSchema>({
    resolver: zodResolver(updateVehicleCategoryFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (open && category) {
      form.reset(toFormValues(category));
      setExistingImageUrl(category.image ?? null);
    }
  }, [open, category, form]);

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const onSubmit = async (values: UpdateVehicleCategoryFormSchema) => {
    if (!category) return;

    const { image, ...rest } = values;
    let imageUrl = existingImageUrl ?? undefined;

    if (image instanceof File) {
      const uploaded = await uploadImage({ file: image, folder: "vehicle-categories" });
      imageUrl = uploaded.url;
    }

    await updateCategory({
      id: category._id,
      payload: toPayload({ ...rest, image: null }, imageUrl ?? ""),
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
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Edit vehicle category</DialogTitle>
          <DialogDescription>
            Update {category?.name ? `"${category.name}"` : "this category"}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input name="name" label="Category name" />

            <Input name="description" type="textarea" label="Description" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input name="passengerCapacity" type="number" label="Passengers" min={1} />
              <Input name="luggageCapacity" type="number" label="Luggage" min={0} />
              <Input name="handLuggageCapacity" type="number" label="Hand luggage" min={0} />
            </div>

            <Input
              name="image"
              type="file"
              label="Category image"
              accept="image/*"
              uploadCompact
              uploadDescription="Drag and drop or click to upload a category photo"
              existingImageUrl={existingImageUrl}
              onClearExistingImage={() => setExistingImageUrl(null)}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="sortOrder" type="number" label="Sort order" />
              <Input
                name="status"
                type="select"
                label="Status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-default-900">Default category</p>
                <p className="mt-0.5 text-xs text-default-500">
                  Use as the default option when booking.
                </p>
              </div>
              <Input name="isDefault" type="switch" switchSize="md" className="shrink-0" />
            </div>

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

export default EditVehicleCategoryModel;
