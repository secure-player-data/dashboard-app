import AccessControlPanel from '@/components/access-control/access-control-panel'
import { useAuth } from '@/context/auth-context'
import { useGetResourceList } from '@/use-cases/use-get-resource-list'
import { createFileRoute } from '@tanstack/react-router'
import { DiscAlbum, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/__dashboard/manage-access')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session, pod } = useAuth()

  const { data: resourceList, isPending: resourcesPending } =
    useGetResourceList(session, pod)
  if (resourcesPending) {
    return (
      <div className="grid place-items-center h-full">
        <Loader2 className="size-4 animate-spin" />
      </div>
    )
  }

  return <AccessControlPanel resourceList={resourceList!} />
}
