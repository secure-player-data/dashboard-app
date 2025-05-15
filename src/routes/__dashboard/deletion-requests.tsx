import { columns } from '@/components/tables/request-overview/columns'
import { DataTable } from '@/components/tables/request-overview/data-table'
import { useAuth } from '@/context/auth-context'
import { useGetDeletionRequests } from '@/use-cases/data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__dashboard/deletion-requests')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session, pod } = useAuth()
  const { data, isPending, error } = useGetDeletionRequests(session, pod)

  return (
    <DataTable
      columns={columns}
      data={data ?? []}
      isLoading={isPending}
      error={error?.message}
    />
  )
}
