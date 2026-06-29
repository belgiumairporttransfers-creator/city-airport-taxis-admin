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
  createVehicleCategoryFormSchema,
  type CreateVehicleCategoryFormSchema,
} from "@/lib/schemas";
import { useCreateVehicleCategory } from "@/hooks/queries/use-vehicle-categories";
import { useUpload } from "@/hooks/queries/use-upload";

const defaultValues: CreateVehicleCategoryFormSchema = {
  name: "",
  description: "",
  passengerCapacity: 3,
  luggageCapacity: 2,
  sortOrder: 0,
  status: "active",
  isDefault: false,
  image: null,
};

export type CreateVehicleCategoryModelProps = {
  open: boolean;
  onClose: () => void;
};

const CreateVehicleCategoryModel = ({ open, onClose }: CreateVehicleCategoryModelProps) => {
  const { mutateAsync: createCategory, isPending } = useCreateVehicleCategory();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUpload();
  const isBusy = isPending || isUploading;

  const form = useForm<CreateVehicleCategoryFormSchema>({
    resolver: zodResolver(createVehicleCategoryFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      form.reset(defaultValues);
    }
  }, [open, form]);

  const handleClose = () => {
    if (isBusy) return;
    onClose();
  };

  const onSubmit = async (values: CreateVehicleCategoryFormSchema) => {
    const { image, ...rest } = values;
    let imageUrl: string | undefined;

    if (image instanceof File) {
      const uploaded = await uploadImage({ file: image, folder: "vehicle-categories" });
      imageUrl = uploaded.url;
    }

    await createCategory({
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
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Create vehicle category</DialogTitle>
          <DialogDescription>
            Add a fleet category such as Executive Sedan, SUV, or Minivan.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input name="name" label="Category name" />

            <Input name="description" type="textarea" label="Description" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input name="passengerCapacity" type="number" label="Passengers" min={1} />
              <Input name="luggageCapacity" type="number" label="Luggage" min={0} />
            </div>

            <Input
              name="image"
              type="file"
              label="Category image"
              accept="image/*"
              uploadCompact
              uploadDescription="Drag and drop or click to upload a category photo"
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
              <Button type="submit" isLoading={isBusy} loadingText="Creating...">
                Create category
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVehicleCategoryModel;
