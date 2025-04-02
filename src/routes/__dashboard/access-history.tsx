import { columns } from '@/components/tables/access-history/columns';
import { DataTable } from '@/components/tables/access-history/data-table';
import { useAuth } from '@/context/auth-context';
import { useGetAccessHistory } from '@/use-cases/access-history';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute('/__dashboard/access-history')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const { limit, page } = Route.useSearch();

  const { data, isPending, error } = useGetAccessHistory(
    session,
    pod,
    limit ?? 25,
    page ?? 1
  );

  return (
    <DataTable
      data={data?.items ?? []}
      total={data?.total ?? 0}
      columns={columns}
      isLoading={isPending}
      error={error?.message}
      limit={limit ?? 25}
      page={page ?? 1}
    />
  );
}
