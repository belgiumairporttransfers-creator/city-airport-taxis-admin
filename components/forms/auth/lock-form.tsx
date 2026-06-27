"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatar from "@/public/images/avatar/avatar-7.jpg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { lockSchema, type LockSchema } from "@/lib/schemas";

const LockForm = () => {
  const form = useForm<LockSchema>({
    resolver: zodResolver(lockSchema),
    mode: "all",
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = () => {};

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <span className="inline-block">
          <SiteLogo className="h-10 w-10 2xl:h-14 2xl:w-14 text-primary" />
        </span>
      </div>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900 text-center">
        Lock Screen
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6 text-center">
        Enter the information you entered while registering.
      </div>

      <div className="mt-6 flex justify-center">
        <Avatar className="h-[72px] w-[72px]">
          <AvatarImage src={avatar.src} alt="" />
          <AvatarFallback>CC</AvatarFallback>
        </Avatar>
      </div>
      <div className="text-center mt-4 text-xl font-medium text-default-900">
        City Cab Admin
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="2xl:mt-7 mt-8"
        >
          <Input name="password" label="Password" type="password" />

          <div className="mt-6">
            <Button className="w-full" responsive>
              Sign In
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 text-center text-base font-medium text-default-600">
        Not you? Return{" "}
        <Link href="/auth/login" className="text-primary">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default LockForm;
