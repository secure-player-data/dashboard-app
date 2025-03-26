import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React, { useEffect, useMemo } from 'react';
import { Button, ButtonWithLoader } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';
import { useLayout } from '@/context/layout-context';
import { convertKebabCaseToString } from '@/utils';
import { DeleteDataDialog } from '@/components/dialogs/delete-data-dialog';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  category: string;
  name: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  category,
  name,
}: DataTableProps<TData, TValue>) {
  const { setLayout } = useLayout();
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

  const numberOfSelectedRows = useMemo(() => {
    return Object.keys(rowSelection).length;
  }, [rowSelection]);

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
          <DeleteDataDialog numberOfSelected={numberOfSelectedRows} />
          <div>
            <Button
              onClick={() => setLayout('list')}
              variant="outline"
              className="rounded-r-none"
            >
              <List />
            </Button>
            <Button
              onClick={() => setLayout('grid')}
              variant="outline"
              className="rounded-l-none"
            >
              <Grid />
            </Button>
          </div>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
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
