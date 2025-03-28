import { RequestOverviewDialog } from '@/components/dialogs/request-overview-dialog';
import { Badge } from '@/components/ui/badge';
import { DataDeletionRequest } from '@/entities/data-info';
import { ColumnDef } from '@tanstack/react-table';
import { Check, Clock } from 'lucide-react';

export const columns: ColumnDef<DataDeletionRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Id',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;

      if (status === 'Requested') {
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Requested
          </Badge>
        );
      }

      if (status === 'Confirmed') {
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <Check className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const data = row.original;

      return <RequestOverviewDialog data={data} />;
    },
  },
];
