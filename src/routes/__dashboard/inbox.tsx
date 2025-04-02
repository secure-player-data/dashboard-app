import { columns } from '@/components/tables/inbox-table/columns';
import { useAuth } from '@/context/auth-context';
import { createFileRoute } from '@tanstack/react-router';
import { DataTable } from '@/components/tables/inbox-table/data-table';
import { useGetInbox } from '@/use-cases/invitations';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys as inboxQueryKeys } from '@/use-cases/invitations';
import { toast } from 'sonner';
import { updateSeenMessages } from '@/api/inbox';
import { useEffect } from 'react';

export const Route = createFileRoute('/__dashboard/inbox')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const { error, isPending, data } = useGetInbox(session, pod);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function clearInbox() {
      await updateSeenMessages(session, pod);
      queryClient.invalidateQueries({
        queryKey: inboxQueryKeys.inboxItemAmount(session?.info.webId ?? ''),
      });
    }

    clearInbox();
  }, []);

  if (isPending) {
    return (
      <div className="grid place-items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  async function refreshInbox() {
    await queryClient.invalidateQueries({
      queryKey: inboxQueryKeys.inbox(session?.info.webId ?? ''),
    });
    toast.info('Inbox refreshed');
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Inbox</h1>
          <p className="text-muted-foreground">View all your notifications</p>
        </div>
        <div>
          <Button
            variant="outline"
            title="Refresh inbox"
            aria-label="Refresh inbox"
            onClick={refreshInbox}
          >
            <RefreshCcw />
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isPending}
        error={''}
      ></DataTable>
    </div>
  );
}
