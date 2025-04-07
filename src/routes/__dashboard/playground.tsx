import { sortAppendContainer } from '@/api/background-processes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const handleClick = async () => {
    if (!session || !pod) {
      throw new Error('pod or session was not defined');
    }
    await sortAppendContainer(session, pod, 'access-history');
  };
  return <Button onClick={handleClick}> sort </Button>;
}
