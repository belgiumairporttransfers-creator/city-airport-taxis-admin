"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home, Plus, ShieldCheck } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import {
  getVehiclePricingColumns,
  getVehiclePricingFilterColumns,
} from "@/components/data-table/columns/vehicle-pricing-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";
import CreateVehiclePricingModel from "@/components/models/create-vehicle-pricing-model";
import EditVehiclePricingModel from "@/components/models/edit-vehicle-pricing-model";
import { useVehicleCategories } from "@/hooks/queries/use-vehicle-categories";
import {
  useDeleteVehiclePricing,
  useUpdateVehiclePricing,
  useValidateVehiclePricingStructure,
  useVehiclePricing,
} from "@/hooks/queries/use-vehicle-pricing";
import type { VehiclePricing, VehiclePricingStatus } from "@/lib/schemas";
import { formatDistance } from "@/lib/utils";

const VehiclePricingPage = () => {
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
  const [slabToEdit, setSlabToEdit] = React.useState<VehiclePricing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [slabToDelete, setSlabToDelete] = React.useState<{
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

  const { data, isLoading, isFetching } = useVehiclePricing({
    page,
    limit,
    search,
    categoryId: categoryFilter || undefined,
    status: statusFilter || undefined,
    sort: "sortOrder",
  });

  const { mutateAsync: deletePricing, isPending: isDeleting } = useDeleteVehiclePricing();
  const { isPending: isUpdating } = useUpdateVehiclePricing();
  const { mutateAsync: validateStructure, isPending: isValidating } =
    useValidateVehiclePricingStructure();

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
      router.replace(query ? `/vehicle-pricing?${query}` : "/vehicle-pricing");
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
    () => getVehiclePricingFilterColumns(categories),
    [categories]
  );

  const handleEditRequest = React.useCallback(
    (id: string) => {
      const slab = data?.items.find((item) => item._id === id);
      if (!slab) return;
      setSlabToEdit(slab);
      setEditOpen(true);
    },
    [data?.items]
  );

  const handleDeleteRequest = React.useCallback(
    (id: string) => {
      const slab = data?.items.find((item) => item._id === id);
      const categoryName = slab ? categoryNameById[slab.categoryId] : undefined;
      setSlabToDelete({
        id,
        label: categoryName
          ? `${categoryName} (${formatDistance(slab?.minDistance ?? 0)}+)`
          : "this pricing slab",
      });
      setDeleteDialogOpen(true);
    },
    [data?.items, categoryNameById]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!slabToDelete) return;
    await deletePricing(slabToDelete.id);
    setSlabToDelete(null);
  }, [slabToDelete, deletePricing]);

  const handleValidateStructure = async () => {
    if (!categoryFilter) return;
    await validateStructure(categoryFilter);
  };

  const columns = React.useMemo(
    () =>
      getVehiclePricingColumns({
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
        <BreadcrumbItem>Pricing</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Vehicle pricing
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Distance-based fare slabs per vehicle category.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!categoryFilter || isValidating}
              onClick={() => void handleValidateStructure()}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {isValidating ? "Validating..." : "Validate structure"}
            </Button>
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add slab
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            searchKey="categoryName"
            searchPlaceholder="Search pricing by category or type"
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

      <CreateVehiclePricingModel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
        defaultCategoryId={categoryFilter || undefined}
      />

      <EditVehiclePricingModel
        open={editOpen}
        slab={slabToEdit}
        onClose={() => {
          setEditOpen(false);
          setSlabToEdit(null);
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSlabToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete pricing slab?"
        description={`This will permanently delete the pricing slab for ${slabToDelete?.label ?? "this category"}.`}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </>
  );
};

export default VehiclePricingPage;
