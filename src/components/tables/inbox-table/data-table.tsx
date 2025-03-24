import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  Table as ITable,
} from '@tanstack/react-table';
import { useAuth } from '@/context/auth-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { InboxItem } from '@/entities/inboxItem';
import { InboxTableRowDialog } from '@/components/dialogs/inbox/inbox-item-main';

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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
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
              data={data as InboxItem[]}
            />
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground text-center mt-2">
        All items in your inbox
      </p>
    </div>
  );
}

function TableContent<TData, TValue>({
  columns,
  table,
  isLoading,
  error,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  table: ITable<TData>;
  isLoading: boolean;
  error: string | undefined;
  data: InboxItem[];
}) {
  const { session, pod } = useAuth();

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

  return (
    <>
      {table.getRowModel().rows.map((row) => (
        <InboxTableRowDialog
          key={row.id}
          session={session!}
          pod={pod!}
          data={data}
          row={row}
        />
      ))}
    </>
  );
}
