import { Button } from '@/components/ui/button';
import { Member } from '@/entities/data/member';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronRight } from 'lucide-react';

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    id: 'view',
    cell: ({ row }) => {
      const pod = row.original.pod;

      return (
        <Button variant="link" asChild className="p-0">
          <Link to="/team/members/$pod" params={{ pod }}>
            View <ChevronRight className="size-4" />
          </Link>
        </Button>
      );
    },
  },
];
