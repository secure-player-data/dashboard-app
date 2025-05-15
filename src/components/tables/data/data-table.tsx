import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  Table as ITable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';
import { EyeOff, Loader2, RefreshCcw, Upload } from 'lucide-react';
import { convertKebabCaseToString, handleError } from '@/utils';
import { DeleteDataDialog } from '@/components/dialogs/delete-data-dialog';
import { DataInfo } from '@/entities/data-info';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys as dataQueryKeys } from '@/use-cases/data';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  error: Error | null;
  category: string;
  pod: string;
  name: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
  category,
  pod,
  name,
}: DataTableProps<TData, TValue>) {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  async function refreshData() {
    await queryClient.invalidateQueries({
      queryKey: dataQueryKeys.allData(pod, category),
    });
    clearSelection();
    toast.info(`${convertKebabCaseToString(category)} refreshed`);
  }

  function clearSelection() {
    setRowSelection({});
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between w-full">
        <div>
          <h1 className="font-bold text-2xl">
            {convertKebabCaseToString(category)}
          </h1>
          <p className="text-muted-foreground">
            Viewing {convertKebabCaseToString(category)} for {name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            title="Refresh data"
            aria-label="Refresh data"
            onClick={refreshData}
          >
            <RefreshCcw />
          </Button>
          <Button variant="outline" asChild>
            <Link to="/manage-access">
              <EyeOff className="size-4" />
              Manage Access
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/team/upload-data" search={{ dataType: `${category}/` }}>
              <Upload />
              Upload data
            </Link>
          </Button>
          <DeleteDataDialog
            selected={table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original as DataInfo)}
            onDelete={clearSelection}
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <TableContent
              columns={columns}
              table={table}
              isLoading={isLoading}
              error={error}
            />
          </TableBody>
        </Table>
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  );
}

function TableContent<TData, TValue>({
  columns,
  table,
  isLoading,
  error,
}: {
  columns: ColumnDef<TData, TValue>[];
  table: ITable<TData>;
  isLoading: boolean;
  error: Error | null;
}) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24">
          <Loader2 className="animate-spin mx-auto" />
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {handleError(error)}
        </TableCell>
      </TableRow>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results found. Refresh data using the button at the top right.
        </TableCell>
      </TableRow>
    );
  }

  return table.getRowModel().rows.map((row) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}
