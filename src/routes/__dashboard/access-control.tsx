import AccessControlProvider from '@/components/tables/access-control/access-control-context';
import { columns } from '@/components/tables/access-control/columns';
import { DataTable } from '@/components/tables/access-control/data-table';
import { useAuth } from '@/context/auth-context';
import { useGetMembersWithPermissions } from '@/use-cases/use-get-members-with-permissions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/access-control')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  const { data, error, isPending } = useGetMembersWithPermissions(session, pod);

  return (
    <div>
      <AccessControlProvider>
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isPending}
          error={error?.message}
        />
      </AccessControlProvider>
    </div>
  );
}
