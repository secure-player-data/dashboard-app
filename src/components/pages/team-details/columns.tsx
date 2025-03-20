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
                <Link to="/player/$pod/personal-data" params={{ pod: pod }}>
                  <User />
                  Player Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/player/$pod/football-data" params={{ pod: pod }}>
                  <Volleyball />
                  Football Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/player/$pod/tracking-data" params={{ pod: pod }}>
                  <Locate />
                  Tracking Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                {/* TODO: Update link when biometric data is implemented */}
                <Link to="/" search={{ player: pod }}>
                  <Fingerprint />
                  Biometric Data
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/player/$pod/health-data" params={{ pod: pod }}>
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
