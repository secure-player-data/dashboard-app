import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';
import { queryKeys } from '@/use-cases/access-history';
import { useMemo } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  total: number;
  isLoading: boolean;
  error: string | undefined;
  limit: number;
  page: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  isLoading,
  error,
  limit,
  page,
}: DataTableProps<TData, TValue>) {
  const queryClient = useQueryClient();
  const { pod } = useAuth();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const numberOfPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

  async function refreshHistory() {
    if (!pod) {
      toast.error(
        'Failed to refresh access history: Pod not found. Please try again later.'
      );
      return;
    }

    await queryClient.invalidateQueries({
      queryKey: queryKeys.getAll(pod, limit, page),
    });
    toast.info('Access history refreshed');
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Access History</h1>
          <p className="text-muted-foreground">
            View users that have accessed your data
          </p>
        </div>
        <Button
          variant="outline"
          title="Refresh history"
          aria-label="Refresh history"
          onClick={refreshHistory}
        >
          <RefreshCcw />
        </Button>
      </div>
      <div className="grid gap-2">
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
        <div className="flex justify-center items-center gap-2">
          <Button asChild variant="outline" disabled={page === 1}>
            <Link
              to="/access-history"
              search={{
                limit: limit,
                page: page === 1 ? undefined : page - 1,
              }}
            >
              Prev
            </Link>
          </Button>
          <p>
            {page} / {numberOfPages}
          </p>
          <Button asChild variant="outline" disabled={page === numberOfPages}>
            <Link
              to="/access-history"
              search={{ limit: limit, page: page + 1 }}
            >
              Next
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground text-center my-2">
        All agents that have accessed some of your resources.
      </p>
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

  return table.getRowModel().rows.map((row) => (
    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          width={cell.id.endsWith('permissions') ? '370px' : undefined}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}
