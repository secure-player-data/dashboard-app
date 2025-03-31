import { DataTable } from '@/components/tables/data/data-table';
import { columns } from '@/components/tables/data/columns';
import { useAuth } from '@/context/auth-context';
import { useGetData } from '@/use-cases/data';
import { useGetProfile } from '@/use-cases/profile';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/player/$pod/$category')({
  component: RouteComponent,
});

function RouteComponent() {
  const { category, pod } = Route.useParams();
  const { session } = useAuth();
  const { data: profile } = useGetProfile(session, pod);
  const { data, isPending, error } = useGetData(session, pod, category);

  return (
    <DataTable
      data={data ?? []}
      columns={columns}
      isLoading={isPending}
      error={error?.message}
      pod={pod}
      category={category}
      name={profile?.name ?? ''}
    />
  );
}
