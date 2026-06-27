"use client";

import SettingsProfileCard from "./settings/settings-profile-card";
import RecentDevice from "./settings/recent-device";
import RecentActivities from "./settings/recent-activities";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalDetailsForm from "@/components/forms/profile/personal-details-form";
import ChangePasswordForm from "@/components/forms/profile/change-password-form";

const ProfilePage = () => {
  const tabs: {
    label: string;
    value: string;
  }[] = [
    {
      label: "Personal Details",
      value: "personal",
    },
    {
      label: "Change Password",
      value: "password",
    },
  ];

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-12 gap-6 items-stretch">
        <div className="col-span-12 flex lg:col-span-4">
          <SettingsProfileCard />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <Card className="flex h-full flex-col">
            <Tabs defaultValue="personal" className="flex h-full flex-col gap-0">
              <TabsList className="h-fit w-full shrink-0 justify-start gap-12 overflow-x-auto rounded-none rounded-t-md border-b border-border bg-card px-5 pt-6 pb-2.5 md:overflow-hidden">
                {tabs.map((tab, index) => (
                  <TabsTrigger
                    className="relative px-0 capitalize transition duration-150 before:absolute before:-bottom-[11px] before:left-1/2 before:h-[2px] before:w-0 before:-translate-x-1/2 before:transition-all before:duration-150 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:before:w-full data-[state=active]:before:bg-primary"
                    value={tab.value}
                    key={`tab-${index}`}
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="personal" className="mt-0 flex flex-1 flex-col p-6">
                <PersonalDetailsForm />
              </TabsContent>
              <TabsContent value="password" className="mt-0 flex flex-1 flex-col p-6">
                <ChangePasswordForm />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 items-stretch gap-6">
        <div className="col-span-12 flex lg:col-span-6">
          <RecentActivities />
        </div>
        <div className="col-span-12 flex lg:col-span-6">
          <RecentDevice />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
