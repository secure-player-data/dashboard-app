import { columns } from '@/components/pages/team-details/columns';
import { DataTable } from '@/components/pages/team-details/data-table';
import { useAuth } from '@/context/auth-context';
import { useGetMembers } from '@/use-cases/use-get-members';

export default function MembersList() {
  const { session, pod } = useAuth();

  const { data, isPending, error } = useGetMembers(session, pod);

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      isLoading={isPending}
      error={error?.message}
    />
  );
}
