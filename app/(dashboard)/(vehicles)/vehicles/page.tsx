"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home, Plus } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { getVehicleColumns, getVehicleFilterColumns } from "@/components/data-table/columns/vehicle-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";
import CreateVehicleModel from "@/components/models/create-vehicle-model";
import EditVehicleModel from "@/components/models/edit-vehicle-model";
import { useVehicleCategories } from "@/hooks/queries/use-vehicle-categories";
import { useDeleteVehicle, useUpdateVehicle, useVehicles } from "@/hooks/queries/use-vehicles";
import type { Vehicle, VehicleStatus } from "@/lib/schemas";

const VehiclesPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<VehicleStatus | "">("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [vehicleToEdit, setVehicleToEdit] = React.useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  const { data, isLoading, isFetching } = useVehicles({
    page,
    limit,
    search,
    status: statusFilter || undefined,
    categoryId: categoryFilter || undefined,
  });
  const { data: categoriesData } = useVehicleCategories({ page: 1, limit: 100 });
  const { mutateAsync: deleteVehicle, isPending: isDeleting } = useDeleteVehicle();
  const { isPending: isUpdating } = useUpdateVehicle();

  const categories = categoriesData?.items ?? [];

  const categoryNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((category) => {
      map[category._id] = category.name;
    });
    return map;
  }, [categories]);

  const handleEditRequest = React.useCallback(
    (id: string) => {
      const vehicle = data?.items.find((item) => item._id === id);
      if (!vehicle) return;
      setVehicleToEdit(vehicle);
      setEditOpen(true);
    },
    [data?.items]
  );

  const handleDeleteRequest = React.useCallback(
    (id: string) => {
      const vehicle = data?.items.find((item) => item._id === id);
      setVehicleToDelete({
        id,
        label: vehicle
          ? `${vehicle.registrationNumber} — ${vehicle.make} ${vehicle.model}`
          : "this vehicle",
      });
      setDeleteDialogOpen(true);
    },
    [data?.items]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!vehicleToDelete) return;
    await deleteVehicle(vehicleToDelete.id);
    setVehicleToDelete(null);
  }, [vehicleToDelete, deleteVehicle]);

  const columnFilters = React.useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];
    if (statusFilter) filters.push({ id: "status", value: [statusFilter] });
    if (categoryFilter) filters.push({ id: "categoryId", value: [categoryFilter] });
    return filters;
  }, [statusFilter, categoryFilter]);

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const statusValues = nextFilters.find((filter) => filter.id === "status")
        ?.value as string[] | undefined;
      const categoryValues = nextFilters.find((filter) => filter.id === "categoryId")
        ?.value as string[] | undefined;
      setStatusFilter((statusValues?.[0] as VehicleStatus | undefined) ?? "");
      setCategoryFilter(categoryValues?.[0] ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(
    () => getVehicleFilterColumns(categories),
    [categories]
  );

  const columns = React.useMemo(
    () =>
      getVehicleColumns({
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
        <BreadcrumbItem>Vehicles</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">Vehicles</CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Manage registered vehicles and their category assignments.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add vehicle
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            filterColumns={filterColumns}
            columnFilters={columnFilters}
            onColumnFiltersChange={handleColumnFiltersChange}
            manualFiltering
            searchKey="registrationNumber"
            searchPlaceholder="Search by registration, make, or model"
            searchValue={search}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
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

      <CreateVehicleModel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        categories={categories}
      />

      <EditVehicleModel
        open={editOpen}
        vehicle={vehicleToEdit}
        onClose={() => {
          setEditOpen(false);
          setVehicleToEdit(null);
        }}
        categories={categories}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete vehicle?"
        description={`This will permanently delete "${vehicleToDelete?.label ?? "this vehicle"}". This action cannot be undone.`}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </>
  );
};

export default VehiclesPage;
