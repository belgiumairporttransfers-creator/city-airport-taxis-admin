"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { getVehicleFareQuoteColumns } from "@/components/data-table/columns/vehicle-fare-quote-columns";
import VehicleFareQuotesForm from "@/components/forms/vehicle/vehicle-fare-quotes-form";
import { useVehiclePricingQuotes } from "@/hooks/queries/use-vehicle-pricing";
import { formatDistance } from "@/lib/utils";
import type { VehiclePricingQuoteItem } from "@/lib/schemas";

const filterFareQuotes = (items: VehiclePricingQuoteItem[], search: string) => {
  const term = search.trim().toLowerCase();
  if (!term) return items;

  return items.filter((item) => {
    const categoryName = item.category.name.toLowerCase();
    const vehiclesText = item.vehicles
      .map((vehicle) => `${vehicle.registrationNumber} ${vehicle.make} ${vehicle.model}`)
      .join(" ")
      .toLowerCase();
    const pricingType = item.fare?.slab?.pricingType?.replaceAll("_", " ") ?? "";

    return (
      categoryName.includes(term) ||
      vehiclesText.includes(term) ||
      pricingType.includes(term)
    );
  });
};

const VehicleFareQuotesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const distanceFromUrl = searchParams.get("distance");

  const [activeDistance, setActiveDistance] = React.useState<number | null>(() => {
    const parsed = Number(distanceFromUrl);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  });
  const [search, setSearch] = React.useState("");

  const { data, isLoading, isFetching, error } = useVehiclePricingQuotes(activeDistance);

  const columns = React.useMemo(() => getVehicleFareQuoteColumns(), []);

  const filteredItems = React.useMemo(
    () => filterFareQuotes(data?.items ?? [], search),
    [data?.items, search]
  );

  const handleSearch = React.useCallback(
    (distance: number) => {
      setActiveDistance(distance);
      setSearch("");

      const params = new URLSearchParams(searchParams.toString());
      params.set("distance", String(distance));
      router.replace(`/vehicle-fare-quotes?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasQuotes = activeDistance !== null;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Vehicles</BreadcrumbItem>
        <BreadcrumbItem>Fare quotes</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="text-lg font-semibold text-default-900">Fare quotes</CardTitle>
          <p className="mt-0.5 text-sm text-default-500">
            Compare category fares and available fleet vehicles for any trip distance.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col items-center gap-2 border-b border-border pb-4">
            <VehicleFareQuotesForm
              defaultDistance={distanceFromUrl}
              onSubmit={handleSearch}
              isLoading={isLoading || isFetching}
            />
            {hasQuotes ? (
              <p className="text-xs text-default-500">
                Showing quotes for{" "}
                <span className="font-medium text-default-700">
                  {formatDistance(activeDistance)}
                </span>
              </p>
            ) : null}
            {error ? (
              <p className="text-xs text-destructive">
                {(error as { message?: string }).message ?? "Failed to load fare quotes."}
              </p>
            ) : null}
          </div>

          {hasQuotes ? (
            <DataTable
              columns={columns}
              data={filteredItems}
              searchKey="category"
              searchPlaceholder="Search quotes by category, vehicle, or type"
              searchValue={search}
              onSearchChange={setSearch}
              loading={isLoading}
              fetching={isFetching}
              pageSizeOptions={[10, 20, 50]}
              getRowId={(row) => row.category._id}
            />
          ) : (
            <p className="py-6 text-center text-sm text-default-400">
              Enter a distance and click Check prices to view fares.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default VehicleFareQuotesPage;
