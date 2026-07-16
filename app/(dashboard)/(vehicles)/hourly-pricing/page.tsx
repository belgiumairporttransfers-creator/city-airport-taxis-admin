"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home, Plus } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import {
  getHourlyPricingColumns,
  getHourlyPricingFilterColumns,
} from "@/components/data-table/columns/hourly-pricing-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";
import CreateHourlyPricingModel from "@/components/models/create-hourly-pricing-model";
import EditHourlyPricingModel from "@/components/models/edit-hourly-pricing-model";
import { useVehicleCategories } from "@/hooks/queries/use-vehicle-categories";
import {
  useDeleteHourlyPricing,
  useHourlyPricing,
  useUpdateHourlyPricing,
} from "@/hooks/queries/use-hourly-pricing";
import type { HourlyPricing, VehiclePricingStatus } from "@/lib/schemas";

const HourlyPricingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get("categoryId") ?? "";
  const statusFromUrl = searchParams.get("status") ?? "";

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState(categoryIdFromUrl);
  const [statusFilter, setStatusFilter] = React.useState<VehiclePricingStatus | "">(
    statusFromUrl === "active" || statusFromUrl === "inactive" ? statusFromUrl : ""
  );
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [pricingToEdit, setPricingToEdit] = React.useState<HourlyPricing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [pricingToDelete, setPricingToDelete] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  React.useEffect(() => {
    setCategoryFilter(categoryIdFromUrl);
    setStatusFilter(
      statusFromUrl === "active" || statusFromUrl === "inactive" ? statusFromUrl : ""
    );
    setPage(1);
  }, [categoryIdFromUrl, statusFromUrl]);

  const { data: categoriesData } = useVehicleCategories({ page: 1, limit: 100 });
  const categories = categoriesData?.items ?? [];

  const categoryNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((category) => {
      map[category._id] = category.name;
    });
    return map;
  }, [categories]);

  const { data, isLoading, isFetching } = useHourlyPricing({
    page,
    limit,
    search,
    categoryId: categoryFilter || undefined,
    status: statusFilter || undefined,
    sort: "sortOrder",
  });

  const { mutateAsync: deletePricing, isPending: isDeleting } = useDeleteHourlyPricing();
  const { isPending: isUpdating } = useUpdateHourlyPricing();

  const syncFiltersToUrl = React.useCallback(
    (nextCategoryId: string, nextStatus: VehiclePricingStatus | "") => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextCategoryId) {
        params.set("categoryId", nextCategoryId);
      } else {
        params.delete("categoryId");
      }
      if (nextStatus) {
        params.set("status", nextStatus);
      } else {
        params.delete("status");
      }
      const query = params.toString();
      router.replace(query ? `/hourly-pricing?${query}` : "/hourly-pricing");
    },
    [router, searchParams]
  );

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (categoryFilter) filters.push({ id: "categoryId", value: [categoryFilter] });
    if (statusFilter) filters.push({ id: "status", value: [statusFilter] });
    return filters;
  }, [categoryFilter, statusFilter]);

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const categoryValues = nextFilters.find((filter) => filter.id === "categoryId")
        ?.value as string[] | undefined;
      const statusValues = nextFilters.find((filter) => filter.id === "status")
        ?.value as string[] | undefined;
      const nextCategoryId = categoryValues?.[0] ?? "";
      const nextStatus = (statusValues?.[0] as VehiclePricingStatus | undefined) ?? "";
      setCategoryFilter(nextCategoryId);
      setStatusFilter(nextStatus);
      setPage(1);
      syncFiltersToUrl(nextCategoryId, nextStatus);
    },
    [columnFilters, syncFiltersToUrl]
  );

  const filterColumns = React.useMemo(
    () => getHourlyPricingFilterColumns(categories),
    [categories]
  );

  const handleEditRequest = React.useCallback(
    (id: string) => {
      const pricing = data?.items.find((item) => item._id === id);
      if (!pricing) return;
      setPricingToEdit(pricing);
      setEditOpen(true);
    },
    [data?.items]
  );

  const handleDeleteRequest = React.useCallback(
    (id: string) => {
      const pricing = data?.items.find((item) => item._id === id);
      const categoryName = pricing ? categoryNameById[pricing.categoryId] : undefined;
      setPricingToDelete({
        id,
        label: categoryName
          ? `${categoryName} (${pricing?.duration ?? 0} hrs)`
          : "this hourly pricing",
      });
      setDeleteDialogOpen(true);
    },
    [data?.items, categoryNameById]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!pricingToDelete) return;
    await deletePricing(pricingToDelete.id);
    setPricingToDelete(null);
  }, [pricingToDelete, deletePricing]);

  const columns = React.useMemo(
    () =>
      getHourlyPricingColumns({
        categoryNameById,
        onEdit: handleEditRequest,
        onDelete: handleDeleteRequest,
        isDeleting,
        isUpdating,
      }),
    [categoryNameById, handleEditRequest, handleDeleteRequest, isDeleting, isUpdating]
  );

  const pagination = data?.meta
    ? {
        total: data.meta.total,
        page: data.meta.page,
        limit: data.meta.limit,
        pages: data.meta.totalPages,
      }
    : undefined;

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Vehicles</BreadcrumbItem>
        <BreadcrumbItem>Hourly Pricing</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Hourly pricing
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Duration-based fare rules per vehicle category.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Hourly Pricing
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            searchKey="categoryName"
            searchPlaceholder="Search hourly pricing by category"
            searchValue={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            filterColumns={filterColumns}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            manualFiltering
            loading={isLoading}
            fetching={isFetching}
            pageSizeOptions={[10, 20, 30, 50]}
            pagination={pagination}
            onPageChange={setPage}
            onPageSizeChange={(pageSize) => {
              setPage(1);
              setLimit(pageSize);
            }}
            getRowId={(row) => row._id}
          />
        </CardContent>
      </Card>

      <CreateHourlyPricingModel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        defaultCategoryId={categoryFilter || undefined}
      />

      <EditHourlyPricingModel
        open={editOpen}
        pricing={pricingToEdit}
        onClose={() => {
          setEditOpen(false);
          setPricingToEdit(null);
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPricingToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete hourly pricing?"
        description={`This will permanently delete the hourly pricing for ${pricingToDelete?.label ?? "this category"}.`}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </>
  );
};

export default HourlyPricingPage;
