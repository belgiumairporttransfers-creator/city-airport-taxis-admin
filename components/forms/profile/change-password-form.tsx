"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  changePasswordFormSchema,
  toChangePasswordPayload,
  type ChangePasswordFormSchema,
} from "@/lib/schemas";
import { useAuthChangePassword } from "@/hooks/queries/use-auth";
import FormInfoNote from "@/components/forms/profile/form-info-note";

const defaultValues: ChangePasswordFormSchema = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordForm = () => {
  const { mutate: changePassword, isPending } = useAuthChangePassword();

  const form = useForm<ChangePasswordFormSchema>({
    resolver: zodResolver(changePasswordFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = (values: ChangePasswordFormSchema) => {
    changePassword(toChangePasswordPayload(values));
  };

  const handleCancel = () => {
    form.reset(defaultValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormInfoNote>
          Use a strong, unique password. You will be signed out on all devices after
          changing it.
        </FormInfoNote>
        <div className="grid grid-cols-12 md:gap-x-12 gap-y-5">
          <div className="col-span-12 md:col-span-6">
            <Input
              name="currentPassword"
              label="Current Password"
              type="password"
            />
          </div>
          <div className="col-span-12 md:col-span-6" />
          <div className="col-span-12 md:col-span-6">
            <Input name="newPassword" label="New Password" type="password" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input
              name="confirmPassword"
              label="Confirm Password"
              type="password"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            loadingText="Changing..."
          >
            Change Password
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
