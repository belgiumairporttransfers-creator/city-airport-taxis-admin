"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { DriverApplication } from "@/lib/schemas";
import { DRIVER_DOCUMENT_FIELDS, DRIVER_DOCUMENT_LABELS } from "@/lib/schemas";

type ProfileProgressProps = {
  driver: DriverApplication;
};

type CompletionCheck = {
  label: string;
  isComplete: boolean;
};

const getProfileCompletionChecks = (driver: DriverApplication): CompletionCheck[] => {
  const checks: CompletionCheck[] = [
    {
      label: "Personal information",
      isComplete: Boolean(
        driver.firstName &&
          driver.lastName &&
          driver.email &&
          driver.phone &&
          driver.homeAddress
      ),
    },
    {
      label: "Operating location",
      isComplete: Boolean(driver.operatingCity && driver.operatingCountry),
    },
    {
      label: "Profile photo",
      isComplete: Boolean(driver.profilePhoto?.trim()),
    },
    {
      label: "Vehicle information",
      isComplete: Boolean(
        driver.carType &&
          driver.carColor &&
          driver.licensePlate &&
          driver.carYearModel
      ),
    },
    {
      label: "About section",
      isComplete: Boolean(driver.about?.trim()),
    },
    {
      label: "Skills",
      isComplete: (driver.skills?.length ?? 0) > 0,
    },
  ];

  const missingDocuments = DRIVER_DOCUMENT_FIELDS.filter(
    (field) => !driver.documents?.[field]?.trim()
  );

  if (missingDocuments.length === 0) {
    checks.push({
      label: "Required documents",
      isComplete: true,
    });
  } else {
    missingDocuments.forEach((field) => {
      checks.push({
        label: DRIVER_DOCUMENT_LABELS[field],
        isComplete: false,
      });
    });
  }

  return checks;
};

const getProfileCompletion = (driver: DriverApplication) => {
  const checks = getProfileCompletionChecks(driver);
  const completedCount = checks.filter((check) => check.isComplete).length;
  const percent = Math.round((completedCount / checks.length) * 100);
  const missingItems = checks.filter((check) => !check.isComplete).map((check) => check.label);

  return {
    percent,
    isComplete: percent === 100,
    missingItems,
  };
};

const ProfileProgress = ({ driver }: ProfileProgressProps) => {
  const { percent, isComplete, missingItems } = getProfileCompletion(driver);

  return (
    <Card>
      <CardHeader className="mb-0 border-none">
        <CardTitle className="text-lg font-medium text-default-800">
          Profile Completion
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex flex-col items-end gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <Badge
              className={
                isComplete
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning"
              }
            >
              {isComplete ? "Complete" : "Incomplete"}
            </Badge>
            <Label className="text-sm font-medium text-default-700">
              {percent}% Complete
            </Label>
          </div>
          <Progress value={percent} color="primary" isStripe className="w-full" />
        </div>

        {!isComplete && missingItems.length > 0 ? (
          <div className="mt-4 border-t border-default-200 pt-4">
            <p className="mb-2 text-sm font-medium text-default-800">Missing</p>
            <ul className="space-y-2">
              {missingItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-default-600">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ProfileProgress;
