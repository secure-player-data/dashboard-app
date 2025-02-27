import { getResourceList } from '@/api/access-control/utils';
import AccessControlPanel from '@/components/access-control/access-control-panel';
import { useAuth } from '@/context/auth-context';
import { useGetResourceList } from '@/use-cases/use-get-resource-list';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/__dashboard/access-control')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  const { data, isPending } = useGetResourceList(session, pod);
  console.log(data);

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return <AccessControlPanel resourceList={data!} />;
}
