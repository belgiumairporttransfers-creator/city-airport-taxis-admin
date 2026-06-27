"use client";

import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SendNewsletterForm from "@/components/forms/newsletter/send-newsletter-form";

const SendNewsletterPage = () => {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId") ?? undefined;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Newsletter</BreadcrumbItem>
        <BreadcrumbItem>
          {draftId ? "Edit Draft" : "Send Newsletter"}
        </BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">
            {draftId ? "Edit Newsletter Draft" : "Send Newsletter"}
          </CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            {draftId
              ? "Continue editing your saved newsletter draft."
              : "Compose and send an email to your newsletter subscribers."}
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <SendNewsletterForm draftId={draftId} />
        </CardContent>
      </Card>
    </>
  );
};

export default SendNewsletterPage;
