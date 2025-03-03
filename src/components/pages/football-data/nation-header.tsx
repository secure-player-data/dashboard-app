import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
import { StatHeader } from '../../headers/stat-header';

export function NationHeader() {
  return (
    <>
      <h2 className="font-bold text-xl mb-4">Overall Stats</h2>
      <NationHeaderInner />
    </>
  );
}

function NationHeaderInner() {
  const { session, pod } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, 'nation');
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, 'nation');

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
