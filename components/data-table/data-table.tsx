"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableToolbar,
  type DataTableFilterColumn,
} from "./data-table-toolbar";

export interface DataTablePaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages?: number;
  totalPages?: number;
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterColumns?: DataTableFilterColumn[];
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  manualFiltering?: boolean;
  initialColumnVisibility?: VisibilityState;
  loading?: boolean;
  fetching?: boolean;
  error?: string | null;
  pagination?: DataTablePaginationMeta;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onBulkDelete?: (selectedRows: TData[]) => void | Promise<void>;
  isDeleting?: boolean;
  reorderable?: boolean;
  getRowId?: (row: TData) => string;
  onReorder?: (orderedIds: string[]) => void;
  hideToolbar?: boolean;
  pageSizeOptions?: number[];
  className?: string;
  tableHeadClassName?: string;
  tableRowClassName?: string;
  tableCellClassName?: string;
  minRows?: number;
}

function getDefaultRowId<TData>(row: TData): string {
  const record = row as { id?: string; _id?: string };
  return record.id ?? record._id ?? "";
}

function SortableTableRow<TData, TValue>({
  id,
  row,
  reorderable,
}: {
  id: string;
  row: Row<TData>;
  reorderable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={(row.getIsSelected() && "selected") || (isDragging ? "dragging" : undefined)}
      className={isDragging ? "bg-muted/50 opacity-50" : undefined}
    >
      {reorderable && (
        <TableCell
          className="w-10 cursor-grab p-2 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </TableCell>
      )}
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchKey,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filterColumns = [],
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange: controlledOnColumnFiltersChange,
  manualFiltering = false,
  initialColumnVisibility,
  loading = false,
  fetching = false,
  error = null,
  pagination,
  onPageChange,
  onPageSizeChange,
  onBulkDelete,
  isDeleting = false,
  reorderable = false,
  getRowId = getDefaultRowId,
  onReorder,
  hideToolbar = false,
  pageSizeOptions,
  className,
  tableHeadClassName,
  tableRowClassName,
  tableCellClassName,
  minRows,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columnFilters = controlledColumnFilters ?? internalColumnFilters;
  const onColumnFiltersChange =
    controlledOnColumnFiltersChange ?? setInternalColumnFilters;

  const totalPages = pagination?.pages ?? pagination?.totalPages ?? 1;

  React.useEffect(() => {
    setRowSelection({});
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    pageCount: totalPages,
    enableRowSelection: true,
    autoResetPageIndex: false,
    manualFiltering,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (pagination?.limit) {
      table.setPageSize(pagination.limit);
    }
  }, [pagination?.limit, table]);

  const rowIds = React.useMemo(() => {
    if (!reorderable) {
      return [];
    }

    return table.getRowModel().rows.map((row) => getRowId(row.original));
  }, [getRowId, reorderable, table.getRowModel().rows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) {
      return;
    }

    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onReorder(arrayMove(rowIds, oldIndex, newIndex));
  };

  const colSpan = columns.length + (reorderable ? 1 : 0);
  const dataRows = table.getRowModel().rows;
  const emptyRowCount = minRows ? Math.max(0, minRows - dataRows.length) : 0;

  const tableBodyContent = loading ? (
    <TableRow className={tableRowClassName}>
      <TableCell colSpan={colSpan} className={tableCellClassName}>
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="mb-2 h-5 w-5 animate-spin" />
        </div>
      </TableCell>
    </TableRow>
  ) : error ? (
    <TableRow className={tableRowClassName}>
      <TableCell colSpan={colSpan} className={tableCellClassName}>
        <div className="flex items-center justify-center py-10 font-medium text-destructive">
          {error}
        </div>
      </TableCell>
    </TableRow>
  ) : dataRows.length ? (
    reorderable && onReorder ? (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
          {dataRows.map((row) => (
            <SortableTableRow
              key={getRowId(row.original)}
              id={getRowId(row.original)}
              row={row}
              reorderable={reorderable}
            />
          ))}
        </SortableContext>
      </DndContext>
    ) : (
      <>
        {dataRows.map((row) => (
          <TableRow
            key={getRowId(row.original)}
            data-state={row.getIsSelected() && "selected"}
            className={tableRowClassName}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className={tableCellClassName}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
        {Array.from({ length: emptyRowCount }).map((_, index) => (
          <TableRow
            key={`empty-row-${index}`}
            className={cn(tableRowClassName, "border-transparent")}
          >
            <TableCell className={tableCellClassName} colSpan={colSpan}>
              &nbsp;
            </TableCell>
          </TableRow>
        ))}
      </>
    )
  ) : (
    <TableRow className={tableRowClassName}>
      <TableCell colSpan={colSpan} className={tableCellClassName}>
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          No results found.
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className={cn("space-y-4", className)}>
      {!hideToolbar && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
          filterColumns={filterColumns}
          manualFiltering={manualFiltering}
          onBulkDelete={onBulkDelete}
          isDeleting={isDeleting}
        />
      )}

      <div className="relative overflow-hidden rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={tableRowClassName}>
                {reorderable && <TableHead className={cn("w-10", tableHeadClassName)} />}
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className={tableHeadClassName}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{tableBodyContent}</TableBody>
        </Table>

        <AnimatePresence>
          {fetching && !loading && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DataTablePagination
        table={table}
        totalRows={pagination?.total}
        loading={loading}
        fetching={fetching}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        currentPage={pagination?.page ?? 1}
        totalPages={totalPages}
        pageSizeOptions={pageSizeOptions}
        className={hideToolbar ? "mt-auto" : undefined}
      />
    </div>
  );
}
