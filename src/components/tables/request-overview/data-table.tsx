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
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys as dataQueryKeys } from '@/use-cases/data';
import { useAuth } from '@/context/auth-context';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  error: string | undefined;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
}: DataTableProps<TData, TValue>) {
  const queryClient = useQueryClient();
  const { pod } = useAuth();
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  async function refreshData() {
    if (!pod) {
      toast.error(
        'Failed to refresh data: Pod not found. Please try again later.'
      );
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: dataQueryKeys.deletionRequests(pod),
    });
    toast.info('Data refreshed');
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between w-full">
        <div>
          <h1 className="font-bold text-2xl">Request Overview</h1>
          <p className="text-muted-foreground">
            Overview with status for all sent data deletion requests.
          </p>
        </div>
        <Button
          variant="outline"
          title="Refresh data"
          aria-label="Refresh data"
          onClick={refreshData}
        >
          <RefreshCcw />
        </Button>
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
  error: string | undefined;
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
          {error}
        </TableCell>
      </TableRow>
    );
  }

  if (table.getRowModel().rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          No results.
        </TableCell>
      </TableRow>
    );
  }

  return table.getRowModel().rows?.length ? (
    table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        No results.
      </TableCell>
    </TableRow>
  );
}
