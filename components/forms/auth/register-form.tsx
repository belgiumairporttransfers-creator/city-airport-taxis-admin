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
import { registerSchema, type RegisterSchema } from "@/lib/schemas";

const RegisterForm = () => {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "all",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = () => {};

  return (
    <div className="w-full">
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary" />
      </span>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Hey, Hello 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Create account to start using City Cab
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-5 xl:mt-7"
        >
          <Input name="name" label="Full Name" type="text" />
          <Input
            name="email"
            label="Email"
            type="email"
            className="mt-4"
          />
          <Input
            name="password"
            label="Password"
            type="password"
            className="mt-4"
          />

          <div className="mt-5 flex items-center gap-3 mb-8">
            <Checkbox id="terms" className="border-default-300" />
            <Label
              htmlFor="terms"
              className="text-base font-medium text-default-600"
            >
              You accept our Terms & Conditions
            </Label>
          </div>

          <Button className="w-full">Create an Account</Button>
        </form>
      </Form>

      <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
        Already Registered?{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
