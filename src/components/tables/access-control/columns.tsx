import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MemberWithPermissions } from '@/entities/data/member';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { useAccessControl } from './access-control-context';
import { useAuth } from '@/context/auth-context';

export const columns: ColumnDef<MemberWithPermissions>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const { session } = useAuth();

      const original = row.original;

      return session?.info.webId === original.webId
        ? `${original.name} (You)`
        : original.name;
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    id: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const { session } = useAuth();
      const { setHasMadeChanges } = useAccessControl();

      const [read, setRead] = React.useState(row.original.permissions.read);
      const [write, setWrite] = React.useState(row.original.permissions.write);
      const [append, setAppend] = React.useState(
        row.original.permissions.append
      );
      const [control, setControl] = React.useState(
        row.original.permissions.control
      );

      const disabled = session?.info.webId === row.original.webId;

      return (
        <div className="flex items-center gap-4 w-fit">
          <Label className="flex items-center gap-2">
            <Checkbox
              disabled={disabled}
              checked={read}
              onCheckedChange={() => {
                setHasMadeChanges(true);
                setRead((old) => {
                  row.original.permissions.read = !old;
                  return !old;
                });
              }}
            />
            Read
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              disabled={disabled}
              checked={write}
              onCheckedChange={() => {
                setHasMadeChanges(true);
                setWrite((old) => {
                  row.original.permissions.write = !old;
                  return !old;
                });
              }}
            />
            Write
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              disabled={disabled}
              checked={append}
              onCheckedChange={() => {
                setHasMadeChanges(true);
                setAppend((old) => {
                  row.original.permissions.append = !old;
                  return !old;
                });
              }}
            />
            Append
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox
              disabled={disabled}
              checked={control}
              onCheckedChange={() => {
                setHasMadeChanges(true);
                setControl((old) => {
                  row.original.permissions.control = !old;
                  return !old;
                });
              }}
            />
            Control
          </Label>
        </div>
      );
    },
  },
];
