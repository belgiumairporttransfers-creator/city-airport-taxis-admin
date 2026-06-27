"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Form } from "@/components/ui/form";
import { forgotSchema } from "@/lib/schemas";
import { useAuthForgotPassword } from "@/hooks/queries/use-auth";

const ForgotForm = () => {
  const { mutate: forgot, isPending } = useAuthForgotPassword();

  const form = useForm({
    resolver: zodResolver(forgotSchema),
    mode: "all",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: { email: string }) => {
    forgot(values);
  };

  return (
    <div className="w-full">
      <span className="inline-block">
        <SiteLogo className="h-10 w-10 2xl:w-14 2xl:h-14 text-primary" />
      </span>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Forgot Your Password?
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Enter your email & instructions will be sent to you!
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-5 xl:mt-7"
        >
          <Input name="email" label="Email" type="email" />

          <Button className="w-full mt-6" isLoading={isPending} loadingText="Sending...">
            Send Recovery Email
          </Button>
        </form>
      </Form>

      <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
        Forget it. Send me back to{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotForm;
