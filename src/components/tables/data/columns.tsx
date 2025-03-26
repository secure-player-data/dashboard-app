import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataInfo } from '@/entities/data-info';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  Clock,
  Eye,
  Info,
  Locate,
  MessageSquareMore,
  Play,
  User,
} from 'lucide-react';

export const columns: ColumnDef<DataInfo>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'uploadedBy',
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <User />
          Uploaded By
          {sortDirection === 'asc' ? (
            <ArrowDown />
          ) : sortDirection === 'desc' ? (
            <ArrowUp />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const uploader = row.original.uploader;

      return <p>{uploader.name}</p>;
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Calendar />
          Uploaded At
          {sortDirection === 'asc' ? (
            <ArrowDown />
          ) : sortDirection === 'desc' ? (
            <ArrowUp />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.uploadedAt;
      const formatted = date.toLocaleDateString('en-UK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return <p>{formatted}</p>;
    },
  },
  {
    accessorKey: 'location',
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <Locate />
          Location
          {sortDirection === 'asc' ? (
            <ArrowDown />
          ) : sortDirection === 'desc' ? (
            <ArrowUp />
          ) : null}
        </Button>
      );
    },
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => {
      const sortDirection = column.getIsSorted();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <MessageSquareMore />
          Reason
          {sortDirection === 'asc' ? (
            <ArrowDown />
          ) : sortDirection === 'desc' ? (
            <ArrowUp />
          ) : null}
        </Button>
      );
    },
  },
  {
    accessorKey: 'status',
    header: () => (
      <div className="flex items-center gap-2">
        <Info className="size-4" /> Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      if (status === 'Deletion Requested') {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Deletion Requested
          </Badge>
        );
      }

      if (status === 'Deletion Confirmed') {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Check className="h-3 w-3 mr-1" />
            Deletion Confirmed
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: 'action',
    header: () => (
      <div className="flex items-center gap-2">
        <Play className="size-4" /> Action
      </div>
    ),
    cell: ({ row }) => {
      const file = row.original.file;

      return (
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/file/$url"
            params={{ url: file.url }}
            search={{ name: file.name }}
            className="flex items-center gap-2"
          >
            <Eye className="size-4" /> View
          </Link>
        </Button>
      );
    },
  },
];
