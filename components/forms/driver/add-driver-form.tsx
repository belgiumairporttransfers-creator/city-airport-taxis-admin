"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InstantFileUpload } from "@/components/file-upload/instant-file-upload";
import {
  createDriverFormSchema,
  DRIVER_DOCUMENT_FIELDS,
  DRIVER_DOCUMENT_LABELS,
  type CreateDriverFormInput,
  type CreateDriverPayload,
  type DriverDocumentField,
  type DriverDocumentsPayload,
} from "@/lib/schemas";
import { useCreateDriver } from "@/hooks/queries/use-drivers";
import type { Accept } from "react-dropzone";

const DOCUMENT_ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "application/pdf": [],
};

const documentDefaults = Object.fromEntries(
  DRIVER_DOCUMENT_FIELDS.map((field) => [field, ""])
) as Record<DriverDocumentField, string>;

const defaultValues: CreateDriverFormInput = {
  operatingCountry: "Netherlands",
  operatingCity: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  homeAddress: "",
  carType: "",
  carColor: "",
  licensePlate: "",
  carYearModel: "",
  yearsOfExperience: 0,
  shiftType: "both",
  availableFrom: "06:00",
  availableTo: "22:00",
  about: "",
  skills: "",
  profilePhoto: "",
  ...documentDefaults,
};

const shiftOptions = [
  { label: "Day", value: "day" },
  { label: "Night", value: "night" },
  { label: "Both", value: "both" },
];

const pairGrid = "grid grid-cols-1 gap-5 md:grid-cols-2";
const documentGrid = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3";

const documentGroups: { title: string; fields: DriverDocumentField[] }[] = [
  {
    title: "ID & permits",
    fields: ["chauffeurPassFront", "chauffeurPassBack", "kiwaPermit"],
  },
  {
    title: "Driver license",
    fields: ["driverLicenseFront", "driverLicenseBack"],
  },
  {
    title: "Vehicle photos",
    fields: [
      "carCard",
      "carFrontView",
      "carBackView",
      "carLeftView",
      "carRightView",
      "carInsideView",
      "licensePlateView",
    ],
  },
  {
    title: "Business & insurance",
    fields: ["taxiInsurancePolicy", "kvkUittreksel", "bankCardCopy"],
  },
];

const AddDriverForm = () => {
  const router = useRouter();
  const { mutateAsync: createDriver, isPending } = useCreateDriver();
  const [pendingUploads, setPendingUploads] = useState(0);
  const isBusy = isPending || pendingUploads > 0;

  const form = useForm<CreateDriverFormInput>({
    resolver: zodResolver(createDriverFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const handleUploadStart = () => setPendingUploads((count) => count + 1);
  const handleUploadEnd = () => setPendingUploads((count) => Math.max(0, count - 1));

  const onSubmit = async (values: CreateDriverFormInput) => {
    const { profilePhoto, skills, ...rest } = values;

    const documents = Object.fromEntries(
      DRIVER_DOCUMENT_FIELDS.map((field) => [field, values[field]])
    ) as DriverDocumentsPayload;

    const {
      about,
      operatingCountry,
      operatingCity,
      firstName,
      lastName,
      email,
      phone,
      homeAddress,
      carType,
      carColor,
      licensePlate,
      carYearModel,
      yearsOfExperience,
      shiftType,
      availableFrom,
      availableTo,
    } = rest;

    const parsedSkills = skills
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const payload: CreateDriverPayload = {
      operatingCountry,
      operatingCity,
      firstName,
      lastName,
      email,
      phone,
      homeAddress,
      carType,
      carColor,
      licensePlate,
      carYearModel,
      yearsOfExperience,
      shiftType,
      availableFrom,
      availableTo,
      profilePhoto: profilePhoto?.trim() || undefined,
      skills: parsedSkills?.length ? parsedSkills : undefined,
      about: about?.trim() || undefined,
      documents,
    };

    const driver = await createDriver(payload);

    if (!driver?.id) {
      return;
    }

    router.push(`/drivers/${driver.id}`);
  };

  const renderInstantUploadField = (
    name: DriverDocumentField | "profilePhoto",
    label: string,
    options?: { accept?: Accept; compact?: boolean }
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-sm font-medium text-default-600">{label}</FormLabel>
          <FormControl>
            <InstantFileUpload
              value={field.value ?? ""}
              onChange={field.onChange}
              hasError={!!fieldState.error}
              accept={options?.accept ?? DOCUMENT_ACCEPT}
              compact={options?.compact}
              folder="driver-applications"
              onUploadStart={handleUploadStart}
              onUploadEnd={handleUploadEnd}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="space-y-5 lg:col-span-8">
            <div className={pairGrid}>
              <Input name="firstName" label="First name" />
              <Input name="lastName" label="Last name" />
            </div>

            <div className={pairGrid}>
              <Input name="email" type="email" label="Email" />
              <Input name="phone" label="Phone" />
            </div>

            <Input name="homeAddress" label="Home address" />

            <div className={pairGrid}>
              <Input name="carType" label="Vehicle type" />
              <Input name="carColor" label="Color" />
            </div>

            <div className={pairGrid}>
              <Input name="carYearModel" label="Year / model" />
              <Input name="licensePlate" label="License plate" />
            </div>

            <Input name="about" type="textarea" label="About" rows={10} />
          </div>

          <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-4">
            {renderInstantUploadField("profilePhoto", "Profile photo", {
              accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
              compact: true,
            })}

            <Input name="operatingCountry" label="Country" />
            <Input name="operatingCity" label="City" />
            <Input name="yearsOfExperience" type="number" label="Years of experience" />
            <Input name="shiftType" type="select" label="Shift" options={shiftOptions} />

            <div className={pairGrid}>
              <Input name="availableFrom" type="time" label="Available from" />
              <Input name="availableTo" type="time" label="Available to" />
            </div>

            <Input name="skills" label="Skills" />
          </aside>
        </div>

        <div className="space-y-5 border-t border-border pt-6">
          <div>
            <p className="text-sm font-medium text-default-600">Documents</p>
            <p className="mt-1 text-xs text-default-500">
              Each file uploads immediately when selected. Review the preview before submitting.
            </p>
          </div>

          {documentGroups.map((group) => (
            <div
              key={group.title}
              className="space-y-5 rounded-lg border border-border/80 bg-default-50/30 p-5"
            >
              <p className="text-sm font-medium text-default-600">{group.title}</p>
              <div className={documentGrid}>
                {group.fields.map((field) => (
                  <div key={field}>
                    {renderInstantUploadField(field, DRIVER_DOCUMENT_LABELS[field], { compact: true })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="-mx-6 -mb-6 mt-8 flex flex-col-reverse gap-3 border-t border-border bg-default-50/60 px-6 py-5 sm:-mx-8 sm:-mb-8 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-8">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            className="w-full sm:w-auto"
            disabled={isBusy}
            onClick={() => router.push("/drivers")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={isBusy}
            isLoading={isPending}
            loadingText="Adding driver..."
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add driver
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddDriverForm;
