"use client";

import React from "react";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { Home, Plus } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import {
  getVehicleCategoryColumns,
  getVehicleCategoryFilterColumns,
} from "@/components/data-table/columns/vehicle-category-columns";
import ConfirmationDialog from "@/components/confirmation-dialog";
import CreateVehicleCategoryModel from "@/components/models/create-vehicle-category-model";
import EditVehicleCategoryModel from "@/components/models/edit-vehicle-category-model";
import {
  useDeleteVehicleCategory,
  useUpdateVehicleCategory,
  useVehicleCategories,
} from "@/hooks/queries/use-vehicle-categories";
import type { VehicleCategory, VehicleCategoryStatus } from "@/lib/schemas";

const VehicleCategoriesPage = () => {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<VehicleCategoryStatus | "">("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<VehicleCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, isFetching } = useVehicleCategories({
    page,
    limit,
    search,
    status: statusFilter || undefined,
  });
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteVehicleCategory();
  const { isPending: isUpdating } = useUpdateVehicleCategory();

  const handleEditRequest = React.useCallback(
    (id: string) => {
      const category = data?.items.find((item) => item._id === id);
      if (!category) return;
      setCategoryToEdit(category);
      setEditOpen(true);
    },
    [data?.items]
  );

  const handleDeleteRequest = React.useCallback(
    (id: string) => {
      const category = data?.items.find((item) => item._id === id);
      setCategoryToDelete({
        id,
        name: category?.name ?? "this category",
      });
      setDeleteDialogOpen(true);
    },
    [data?.items]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!categoryToDelete) return;
    await deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  }, [categoryToDelete, deleteCategory]);

  const columnFilters = React.useMemo<ColumnFiltersState>(
    () => (statusFilter ? [{ id: "status", value: [statusFilter] }] : []),
    [statusFilter]
  );

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const nextFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const statusValues = nextFilters.find((filter) => filter.id === "status")
        ?.value as string[] | undefined;
      setStatusFilter((statusValues?.[0] as VehicleCategoryStatus | undefined) ?? "");
      setPage(1);
    },
    [columnFilters]
  );

  const filterColumns = React.useMemo(() => getVehicleCategoryFilterColumns(), []);

  const columns = React.useMemo(
    () =>
      getVehicleCategoryColumns({
        onEdit: handleEditRequest,
        onDelete: handleDeleteRequest,
        isDeleting,
        isUpdating,
      }),
    [handleEditRequest, handleDeleteRequest, isDeleting, isUpdating]
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
        <BreadcrumbItem>Categories</BreadcrumbItem>
      </Breadcrumbs>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-default-900">
              Vehicle categories
            </CardTitle>
            <p className="mt-0.5 text-xs text-default-500">
              Manage fleet classes used for bookings and dispatch.
            </p>
          </div>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add category
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
            searchKey="name"
            searchPlaceholder="Search categories"
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

      <CreateVehicleCategoryModel open={createOpen} onClose={() => setCreateOpen(false)} />

      <EditVehicleCategoryModel
        open={editOpen}
        category={categoryToEdit}
        onClose={() => {
          setEditOpen(false);
          setCategoryToEdit(null);
        }}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete vehicle category?"
        description={`This will permanently delete "${categoryToDelete?.name ?? "this category"}" and all of its vehicles and pricing slabs.`}
        confirmLabel="Delete"
        pendingLabel="Deleting..."
      />
    </>
  );
};

export default VehicleCategoriesPage;
