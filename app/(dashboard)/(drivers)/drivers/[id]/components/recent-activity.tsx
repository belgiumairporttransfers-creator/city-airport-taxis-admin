"use client";

import Image from "next/image";
import { Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DriverApplication } from "@/lib/schemas";

const VEHICLE_IMAGE_FIELDS = [
  { key: "carFrontView", label: "Front" },
  { key: "carBackView", label: "Back" },
  { key: "carLeftView", label: "Left" },
  { key: "carRightView", label: "Right" },
  { key: "carInsideView", label: "Inside" },
  { key: "licensePlateView", label: "Plate" },
] as const;

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);

type RecentActivityProps = {
  driver: DriverApplication;
};

const RecentActivity = ({ driver }: RecentActivityProps) => {
  const documents = driver.documents ?? {};
  const vehicleImages = VEHICLE_IMAGE_FIELDS.map(({ key, label }) => ({
    label,
    url: documents[key],
  })).filter((item) => item.url && isImageUrl(item.url));

  const vehicleDetails = [
    { label: "Vehicle", value: driver.carType },
    { label: "Color", value: driver.carColor },
    { label: "Year / Model", value: driver.carYearModel },
    { label: "License Plate", value: driver.licensePlate },
    { label: "Shift", value: driver.shiftType.replace(/\b\w/g, (c) => c.toUpperCase()) },
    { label: "Availability", value: `${driver.availableFrom} – ${driver.availableTo}` },
  ];

  return (
    <Card>
      <CardHeader className="mb-3 flex-row items-center border-none">
        <CardTitle className="text-lg font-medium text-default-800">Vehicles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border bg-default-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-content-center rounded-lg bg-primary/10 text-primary">
              <Car className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-default-900">{driver.carType}</p>
              <p className="text-sm text-default-500">
                {driver.carColor} · {driver.carYearModel} · {driver.licensePlate}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vehicleDetails.map(({ label, value }) => (
              <div key={label} className="rounded-md border border-border bg-card px-3 py-2">
                <p className="text-xs font-medium text-default-500">{label}</p>
                <p className="mt-0.5 text-sm capitalize text-default-800">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {vehicleImages.length > 0 ? (
          <div className="mt-4">
            <p className="mb-3 text-sm font-medium text-default-700">Vehicle Photos</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {vehicleImages.map(({ label, url }) => (
                <div key={label} className="overflow-hidden rounded-lg border border-border">
                  <div className="relative h-28 w-full bg-default-50">
                    <Image
                      src={url!}
                      alt={`${driver.carType} ${label}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <p className="px-2 py-1.5 text-xs font-medium text-default-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-default-500">No vehicle photos uploaded yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
