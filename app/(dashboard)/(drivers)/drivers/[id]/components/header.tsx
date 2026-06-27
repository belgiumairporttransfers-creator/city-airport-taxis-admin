"use client";

import Link from "next/link";
import { Fragment } from "react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import coverImage from "@/public/images/all-img/user-cover.png";
import defaultAvatar from "@/public/images/avatar/user.png";
import LayoutLoader from "@/components/layout-loader";
import { useDriver } from "@/hooks/queries/use-drivers";
import type { DriverApplicationStatus } from "@/lib/schemas";
import DriverProfileActions from "./driver-profile-actions";

const statusLabels: Record<DriverApplicationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

const formatReviewCount = (count: number) =>
  new Intl.NumberFormat(undefined, {
    notation: count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);

const getDriverReviewStats = (reviews: { rating: number }[] = []) => {
  if (reviews.length === 0) {
    return { averageRating: null, reviewCount: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: totalRating / reviews.length,
    reviewCount: reviews.length,
  };
};

const Header = () => {
  const params = useParams<{ id: string }>();
  const location = usePathname();
  const { data, isLoading } = useDriver(params.id);

  const basePath = `/drivers/${params.id}`;
  const tabs = [
    { title: "Overview", link: basePath },
    { title: "Documents", link: `${basePath}/documents` },
    { title: "Reviews", link: `${basePath}/reviews` },
    { title: "Activity", link: `${basePath}/activity` },
  ];

  if (isLoading) {
    return <LayoutLoader />;
  }

  const driverName = data
    ? `${data.firstName} ${data.lastName}`
    : "Driver Profile";
  const driverSubtitle = data
    ? `${statusLabels[data.status]} · ${data.applicationNumber}`
    : "";
  const profilePhoto = data?.profilePhoto?.trim() ? data.profilePhoto : defaultAvatar;
  const { averageRating, reviewCount } = getDriverReviewStats(data?.reviews);

  return (
    <Fragment>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/drivers">Drivers</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{data?.applicationNumber ?? "Profile"}</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="mt-6 rounded-t-2xl">
        <CardContent className="p-0">
          <div
            className="relative h-[200px] w-full rounded-t-2xl bg-no-repeat object-cover lg:h-[296px]"
            style={{ backgroundImage: `url(${coverImage.src})` }}
          >
            <div className="absolute z-10 flex gap-4 divide-x divide-primary-foreground ltr:right-10 ltr:top-8 rtl:left-10 rtl:top-8 lg:ltr:right-14 lg:top-10">
              <div className="pr-4 text-right">
                <div className="text-xl font-semibold text-primary-foreground">
                  {averageRating !== null ? averageRating.toFixed(1) : "—"}
                </div>
                <div className="mt-1 whitespace-nowrap text-sm text-default-200">Driver Rating</div>
              </div>
              <div className="pl-4 text-right">
                <div className="text-xl font-semibold text-primary-foreground">
                  {formatReviewCount(reviewCount)}
                </div>
                <div className="mt-1 whitespace-nowrap text-sm text-default-200">Reviews</div>
              </div>
            </div>
            {data ? (
              <div className="absolute bottom-5 z-10 ltr:right-6 rtl:left-6 lg:ltr:right-10 lg:rtl:left-10">
                <DriverProfileActions driver={data} />
              </div>
            ) : null}
            <div className="absolute flex items-center gap-4 ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
              <Image
                src={profilePhoto}
                alt={driverName}
                width={128}
                height={128}
                className="h-20 w-20 rounded-full border-4 border-background object-cover lg:h-32 lg:w-32"
              />
              <div>
                <div className="mb-1 text-xl font-semibold text-primary-foreground lg:text-2xl">
                  {driverName}
                </div>
                <div className="pb-1.5 text-xs font-medium text-default-100 dark:text-default-900 lg:text-sm">
                  {driverSubtitle}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-4 px-6 pb-4 pt-7 lg:gap-8 lg:pt-5">
            {tabs.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={cn(
                  "relative text-sm font-semibold text-default-500 hover:text-primary lg:before:absolute lg:before:-bottom-4 lg:before:left-0 lg:before:h-[1px] lg:before:w-full lg:before:bg-transparent",
                  {
                    "text-primary lg:before:bg-primary": location === item.link,
                  }
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default Header;
