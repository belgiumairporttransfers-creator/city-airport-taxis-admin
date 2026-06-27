"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Form } from "@/components/ui/form";
import { loginSchema, type LoginSchema } from "@/lib/schemas";
import { useAuthLogin } from "@/hooks/queries/use-auth";

const LogInForm = () => {
  const { mutate: login, isPending } = useAuthLogin();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (values: LoginSchema) => {
    login(values);
  };

  return (
    <div className="w-full">
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary" />
      </span>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Hey, Hello 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Enter the information you entered while registering.
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="2xl:mt-7 mt-8"
        >
          <Input name="email" label="Email" type="email" />
          <Input
            name="password"
            label="Password"
            type="password"
            className="mt-6"
          />

          <div className="mt-5 mb-6 flex flex-wrap gap-2">
            <Input
              name="rememberMe"
              label="Remember me"
              type="checkbox"
              className="flex-1"
            />
            <Link
              href="/auth/forgot"
              className="flex-none text-sm text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          <Button className="w-full" isLoading={isPending} loadingText="Signing in...">
            Sign In
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-base text-default-600">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-primary">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default LogInForm;
