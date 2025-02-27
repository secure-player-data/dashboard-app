import { InboxItem } from '@/entities/inboxItem';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<InboxItem>[] = [
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'webId',
    header: 'Name',
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
  },

  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const isoDate = row.getValue('date') as Date;
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: 'buttons',
    header: '',
  },
];
