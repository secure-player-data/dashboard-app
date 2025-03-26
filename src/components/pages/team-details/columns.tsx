import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Member } from '@/entities/data/member';
import { Link } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  Calendar,
  Eye,
  Fingerprint,
  Locate,
  User,
  Volleyball,
} from 'lucide-react';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Eye className="size-4" /> View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Data Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'personal-data' }}
                >
                  <User />
                  Player Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'football-data' }}
                >
                  <Volleyball />
                  Football Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'event-data' }}
                >
                  <Calendar />
                  Event Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'tracking-data' }}
                >
                  <Locate />
                  Tracking Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'biometric-data' }}
                >
                  <Fingerprint />
                  Biometric Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to="/player/$pod/$category"
                  params={{ pod: pod, category: 'health-data' }}
                >
                  <Activity />
                  Health Data
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
