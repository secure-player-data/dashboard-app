import { columns } from '@/components/tables/access-history/columns';
import { DataTable } from '@/components/tables/access-history/data-table';
import { useAuth } from '@/context/auth-context';
import { useGetAccessHistory } from '@/use-cases/use-get-access-history';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/access-history')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  // TODO: Add pagination
  const { data, isPending, error } = useGetAccessHistory(session, pod);

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      isLoading={isPending}
      error={error?.message}
    />
  );
}
