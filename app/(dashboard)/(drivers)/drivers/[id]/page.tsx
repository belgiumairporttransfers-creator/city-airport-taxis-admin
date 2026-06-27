"use client";

import { useParams } from "next/navigation";
import { useDriver } from "@/hooks/queries/use-drivers";
import About from "./components/about";
import ProfileProgress from "./components/profile-progress";
import RecentActivity from "./components/recent-activity";
import Skills from "./components/skills";
import UserInfo from "./components/user-info";

const DriverProfileOverviewPage = () => {
  const params = useParams<{ id: string }>();
  const { data } = useDriver(params.id);

  if (!data) {
    return null;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 space-y-6 lg:col-span-4">
        <ProfileProgress driver={data} />
        <UserInfo driver={data} />
        <Skills skills={data.skills ?? []} />
      </div>
      <div className="col-span-12 min-w-0 space-y-6 lg:col-span-8">
        <About about={data.about ?? ""} />
        <RecentActivity driver={data} />
      </div>
    </div>
  );
};

export default DriverProfileOverviewPage;
