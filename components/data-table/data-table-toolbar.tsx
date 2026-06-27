"use client";

import * as React from "react";
import { X, Trash2 } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import type { DataTableFacetedFilterOption } from "./data-table-faceted-filter";

export interface DataTableFilterColumn {
  column: string;
  title: string;
  multiple?: boolean;
  options: DataTableFacetedFilterOption[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterColumns?: DataTableFilterColumn[];
  manualFiltering?: boolean;
  onBulkDelete?: (selectedRows: TData[]) => void | Promise<void>;
  isDeleting?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  filterColumns = [],
  manualFiltering = false,
  onBulkDelete,
  isDeleting = false,
}: DataTableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = React.useState(searchValue ?? "");
  const isServerSearch = Boolean(onSearchChange);
  const isFiltered = table.getState().columnFilters.length > 0;
  const showResetFilters = isFiltered && (!isServerSearch || manualFiltering);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  const isFirstSearchRender = React.useRef(true);

  React.useEffect(() => {
    setLocalSearch(searchValue ?? "");
  }, [searchValue]);

  React.useEffect(() => {
    if (!isServerSearch || !onSearchChange) {
      return;
    }

    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      onSearchChange(localSearch.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [isServerSearch, localSearch, onSearchChange]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (isServerSearch) {
      setLocalSearch(value);
      return;
    }

    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && hasSelectedRows) {
      void onBulkDelete(selectedRows.map((row) => row.original));
    }
  };

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder ?? `Filter by ${searchKey}...`}
          value={isServerSearch ? localSearch : undefined}
          defaultValue={isServerSearch ? undefined : ""}
          onChange={handleSearchChange}
          className="!h-10 max-w-sm"
        />
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {filterColumns.map((filter) => {
          const column = table.getColumn(filter.column);
          return column ? (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
              multiple={filter.multiple}
            />
          ) : null;
        })}

        {showResetFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="!h-8 !px-2 !lg:px-3"
          >
            Reset
            <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
          </Button>
        )}

        {hasSelectedRows && onBulkDelete && (
          <Button
            color="destructive"
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="!h-8 !px-3"
          >
            <Trash2 className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            Delete {selectedRows.length} selected
          </Button>
        )}

        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
