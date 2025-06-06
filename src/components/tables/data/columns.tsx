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
  File,
  Database,
  Handshake,
  PackageOpen,
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
    accessorKey: 'file',
    header: () => (
      <div className="flex items-center gap-2">
        <File className="size-4" /> File
      </div>
    ),
    cell: ({ row }) => {
      const file = row.original.file;

      return <p>{file.name}</p>;
    },
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
          Data Source
          {sortDirection === 'asc' ? (
            <ArrowDown />
          ) : sortDirection === 'desc' ? (
            <ArrowUp />
          ) : null}
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const location = row.original.location;

      return (
        <p
          className={
            status === 'Confirmed' ? 'line-through text-muted-foreground' : ''
          }
        >
          {location}
        </p>
      );
    },
  },
  // {
  //   accessorKey: 'status',
  //   header: () => (
  //     <div className="flex items-center gap-2">
  //       <Info className="size-4" /> Status
  //     </div>
  //   ),
  //   cell: ({ row }) => {
  //     const status = row.original.status;

  //     if (status === 'Requested') {
  //       return (
  //         <Badge
  //           variant="outline"
  //           className="bg-yellow-50 text-yellow-700 border-yellow-200"
  //         >
  //           <Clock className="h-3 w-3 mr-1" />
  //           Requested
  //         </Badge>
  //       );
  //     }

  //     if (status === 'Confirmed') {
  //       return (
  //         <Badge
  //           variant="outline"
  //           className="bg-green-50 text-green-700 border-green-200"
  //         >
  //           <Check className="h-3 w-3 mr-1" />
  //           Confirmed
  //         </Badge>
  //       );
  //     }
  //   },
  // },
  {
    accessorKey: 'stored',
    header: () => (
      <div className="flex items-center gap-2">
        <Database className="size-4" /> Stored At
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <div className="flex gap-4">
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-800 border-purple-200"
          >
            <PackageOpen className="size-4 mr-1" />
            Pod
          </Badge>
          {status !== 'Confirmed' && (
            <Badge
              variant="outline"
              className="bg-cyan-50 text-cyan-800 border-cyan-200"
            >
              <Handshake className="size-4 mr-1" />
              Third Party
            </Badge>
          )}
        </div>
      );
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
            params={{ url: row.original.url }}
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
