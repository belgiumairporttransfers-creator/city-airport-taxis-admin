"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number;
  loading?: boolean;
  fetching?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  totalPages?: number;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  totalRows = 0,
  loading = false,
  fetching = false,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  totalPages = 1,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const pageSize = table.getState().pagination.pageSize;
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  const isDisabled = loading || fetching;

  return (
    <div
      className={cn(
        "flex min-h-[3.25rem] flex-wrap items-center justify-between gap-2 px-2 py-3",
        className
      )}
    >
      <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading page...</span>
          </div>
        ) : (
          <>
            Showing{" "}
            <span className="font-medium">
              {startRow}-{endRow}
            </span>{" "}
            of <span className="font-medium">{totalRows}</span> total row
            {totalRows !== 1 ? "s" : ""}
            {fetching ? " · Updating..." : ""}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 lg:gap-8">
        {pageSizeOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Rows per page
            </p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                table.setPageSize(newPageSize);
                onPageSizeChange?.(newPageSize);
              }}
              disabled={isDisabled}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex w-[110px] items-center justify-center text-sm font-medium text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(1)}
            disabled={currentPage <= 1 || isDisabled}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1 || isDisabled}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange?.(totalPages)}
            disabled={currentPage >= totalPages || isDisabled}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
