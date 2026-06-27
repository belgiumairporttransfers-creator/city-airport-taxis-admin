"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DriverApplication } from "@/lib/schemas";
import { DRIVER_DOCUMENT_FIELDS, DRIVER_DOCUMENT_LABELS } from "@/lib/schemas";

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);

type DriverDocumentsProps = {
  driver: DriverApplication;
};

const DriverDocuments = ({ driver }: DriverDocumentsProps) => {
  const documents = driver.documents ?? {};

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-default-900">
          Documents
        </CardTitle>
        <p className="text-sm text-default-500">
          {driver.firstName} {driver.lastName} · {driver.applicationNumber}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DRIVER_DOCUMENT_FIELDS.map((field) => {
            const url = documents[field];

            return (
              <div
                key={field}
                className="flex flex-col rounded-lg border border-border p-4"
              >
                <p className="text-sm font-medium text-default-900">
                  {DRIVER_DOCUMENT_LABELS[field]}
                </p>

                {url ? (
                  <div className="mt-3 space-y-3">
                    {isImageUrl(url) && (
                      <div className="relative h-32 w-full overflow-hidden rounded-md bg-default-50">
                        <Image
                          src={url}
                          alt={DRIVER_DOCUMENT_LABELS[field]}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View document
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-default-500">Not uploaded</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverDocuments;
