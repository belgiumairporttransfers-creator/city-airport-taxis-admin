"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SiteLogo } from "@/components/svg";
import { Form } from "@/components/ui/form";
import { createPasswordSchema, type CreatePasswordSchema } from "@/lib/schemas";

const CreatePasswordForm = () => {
  const form = useForm<CreatePasswordSchema>({
    resolver: zodResolver(createPasswordSchema),
    mode: "all",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = () => {};

  return (
    <div className="w-full">
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary" />
      </span>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl lg:text-2xl text-xl font-bold text-default-900">
        Create New Password
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Enter your new password below.
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="2xl:mt-7 mt-8"
        >
          <Input name="password" label="New Password" type="password" />
          <Input
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            className="mt-4"
          />

          <div className="mt-5 flex items-center gap-1.5">
            <Checkbox
              size="sm"
              className="border-default-300 mt-[1px]"
              id="terms"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
            >
              You accept our Terms & Conditions
            </Label>
          </div>

          <Button className="w-full mt-8">Reset Password</Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-base text-default-600">
        Not now? Return{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default CreatePasswordForm;
