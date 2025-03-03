import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Input } from '@/components/ui/input';
import React from 'react';
import { ButtonWithLoader } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { useAccessControl } from './access-control-context';
import { useAuth } from '@/context/auth-context';
import { MemberWithPermissions } from '@/entities/data/member';
import { useUpdateActorPermissions } from '@/use-cases/use-update-members-permissions';
import { toast } from 'sonner';

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
  const { session, pod } = useAuth();
  const { hasMadeChanges } = useAccessControl();

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const updateMembersPermissionsMutation = useUpdateActorPermissions(
    session,
    pod
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  function handleSave() {
    toast.promise(
      updateMembersPermissionsMutation.mutateAsync(
        data as MemberWithPermissions[]
      ),
      {
        loading: 'Updating permissions...',
        success: 'Updated!',
        error: 'Something went wrong, please try again.',
      }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search names..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <ButtonWithLoader
          onClick={handleSave}
          disabled={
            !hasMadeChanges || updateMembersPermissionsMutation.isPending
          }
          isLoading={updateMembersPermissionsMutation.isPending}
        >
          <Save className="size-4" />
          Save
        </ButtonWithLoader>
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
      <p className="text-sm text-muted-foreground text-center mt-2">
        All the agents who have access to your pod, along with their specific
        permissions.
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
