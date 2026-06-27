"use client";

import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddDriverForm from "@/components/forms/driver/add-driver-form";

const AddDriverPage = () => {
  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Drivers</BreadcrumbItem>
        <BreadcrumbItem>Add Driver</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">Add Driver</CardTitle>
          <p className="mt-0.5 text-xs text-default-500">
            Manually register a new driver application with profile details and required documents.
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <AddDriverForm />
        </CardContent>
      </Card>
    </>
  );
};

export default AddDriverPage;
