"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type ProfileUser } from "@/lib/chat/types";
import { getAvatarSrc } from "@/lib/chat/types";

type SearchFormValues = {
  search: string;
};

const MyProfileHeader = ({
  profile,
  onSearchChange,
}: {
  profile?: ProfileUser;
  onSearchChange?: (value: string) => void;
}) => {
  const avatarSrc = getAvatarSrc(profile?.avatar);

  const form = useForm<SearchFormValues>({
    defaultValues: { search: "" },
  });

  const search = form.watch("search");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange?.(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, onSearchChange]);

  return (
    <>
      <div className="mb-4 flex gap-3">
        <Avatar className="h-10 w-10">
          {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
          <AvatarFallback>{profile?.fullName.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="block">
          <div className="text-sm font-medium text-default-900 ">
            <span className="relative before:absolute before:top-1.5 before:-right-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-success">
              {profile?.fullName}
            </span>
          </div>
          <span className="text-xs text-default-600">{profile?.bio}</span>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="mb-1 hidden border-b border-border pb-3 lg:block"
        >
          <Input
            name="search"
            type="text"
            placeholder="Search by name"
            inputClassName="h-8 text-xs 2xl:h-8"
            className="mb-0"
          />
        </form>
      </Form>
    </>
  );
};

export default MyProfileHeader;
