import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
import { StatHeader } from './stat-header';

export function ClubHeader({ pod }: { pod: string }) {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Overall Stats</h2>
      <ClubHeaderInner pod={pod} />
    </>
  );
}

function ClubHeaderInner({ pod }: { pod: string }) {
  const { session } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, 'club');
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, 'club');

  return (
    <StatHeader
      footballData={football}
      footballPending={footballPending}
      footballError={footballError}
      eventData={event}
      eventPending={eventPending}
      eventError={eventError}
    />
  );
}
