import { columns } from '@/components/tables/inbox-table/columns';
import { useAuth } from '@/context/auth-context';
import { useGetInbox } from '@/use-cases/invitations/use-get-inbox';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from '@/components/tables/inbox-table/data-table';

export const Route = createFileRoute('/__dashboard/inbox')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const { error, isPending, data } = useGetInbox(session, pod);
  if (isPending) {
    return <div>Loading</div>;
  }
  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isPending}
        error={''}
      ></DataTable>
    </div>
  );
}
