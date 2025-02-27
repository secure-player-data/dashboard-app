import { getPermissionDetails } from '@/api/access-control/utils';
import AccessControlPanel from '@/components/access-control/access-control-panel';
import { useAuth } from '@/context/auth-context';
import { useGetPermissionDetails } from '@/use-cases/use-get-permission-details';
import { useGetResourceList } from '@/use-cases/use-get-resource-list';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/__dashboard/access-control')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  const { data: resourceList, isPending: resourcesPending } =
    useGetResourceList(session, pod);
  if (resourcesPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return <AccessControlPanel resourceList={resourceList!} />;
}
