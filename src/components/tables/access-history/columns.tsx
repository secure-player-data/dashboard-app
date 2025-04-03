import { BASE_APP_CONTAINER, DATA_CONTAINER } from '@/api/paths';
import { AccessHistory } from '@/entities/access-history';
import { ColumnDef } from '@tanstack/react-table';
import { Folder, File } from 'lucide-react';

export const columns: ColumnDef<AccessHistory>[] = [
  {
    accessorKey: 'fileType',
    header: 'Type',
    cell: ({ row }) => {
      const url = row.original.resource;
      const isFolder = url.endsWith('/');

      if (isFolder) {
        return <Folder className="size-4" />;
      }

      return <File className="size-4" />;
    },
  },
  {
    accessorKey: 'webId',
    header: 'Web ID',
  },
  {
    accessorKey: 'resource',
    header: 'Resource',
    cell: ({ row }) => {
      const url = row.original.resource;

      const relativeUrl = url.split(`${BASE_APP_CONTAINER}/`)[1];

      return decodeURIComponent(relativeUrl);
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
  },
  {
    accessorKey: 'time',
    header: 'Date & Time',
    cell: ({ row }) => {
      const date = row.original.time;

      return date.toLocaleString('no-NB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    },
  },
];
