import { DataTable } from '@/components/tables/data/data-table';
import { columns } from '@/components/tables/data/columns';
import { useAuth } from '@/context/auth-context';
import { useGetDataByCategory } from '@/use-cases/data';
import { useGetProfile } from '@/use-cases/profile';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/player/$pod/$category')({
  component: RouteComponent,
});

function RouteComponent() {
  const { category, pod } = Route.useParams();
  const { session } = useAuth();
  const { data: profile } = useGetProfile(session, pod);
  const { data, isPending, error } = useGetDataByCategory(
    session,
    pod,
    category
  );

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      isLoading={isPending}
      error={error}
      pod={pod}
      category={category}
      name={profile?.name ?? ''}
    />
  );
}
