"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  personalDetailsFormSchema,
  toUpdateProfilePayload,
  type PersonalDetailsFormSchema,
} from "@/lib/schemas";
import { useAuthMe, useAuthUpdateProfile } from "@/hooks/queries/use-auth";
import LayoutLoader from "@/components/layout-loader";
import FormInfoNote from "@/components/forms/profile/form-info-note";

const PersonalDetailsForm = () => {
  const { data: admin, isLoading } = useAuthMe();
  const { mutate: updateProfile, isPending } = useAuthUpdateProfile();

  const form = useForm<PersonalDetailsFormSchema>({
    resolver: zodResolver(personalDetailsFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        firstName: admin.firstName ?? "",
        lastName: admin.lastName ?? "",
        phoneNumber: admin.phoneNumber ?? "",
        email: admin.email ?? "",
      });
    }
  }, [admin, form]);

  const onSubmit = (values: PersonalDetailsFormSchema) => {
    updateProfile(toUpdateProfilePayload(values));
  };

  const handleCancel = () => {
    if (admin) {
      form.reset({
        firstName: admin.firstName ?? "",
        lastName: admin.lastName ?? "",
        phoneNumber: admin.phoneNumber ?? "",
        email: admin.email ?? "",
      });
    }
  };

  if (isLoading) {
    return <LayoutLoader />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormInfoNote>
          Update your name and phone here. Email is read-only. Change your photo from the
          profile card on the left.
        </FormInfoNote>
        <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
          <div className="col-span-12 md:col-span-6">
            <Input name="firstName" label="First Name" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="lastName" label="Last Name" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="phoneNumber" label="Phone Number" type="tel" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input name="email" label="Email Address" type="email" readOnly />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} loadingText="Saving...">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonalDetailsForm;
