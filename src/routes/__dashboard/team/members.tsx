import { columns } from '@/components/tables/members/columns';
import { DataTable } from '@/components/tables/members/data-table';
import { useAuth } from '@/context/auth-context';
import { useGetMembers } from '@/use-cases/use-get-members';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/team/members')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  const { data, isPending, error } = useGetMembers(session, pod);

  return (
    <div>
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isPending}
        error={error?.message}
      />
    </div>
  );
}
