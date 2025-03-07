import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
import { StatHeader } from '../../headers/stat-header';

export default function SeasonsOverview({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Overall Stats</h2>
      <SeasonsOverviewInner pod={pod} type={type} />
    </>
  );
}

function SeasonsOverviewInner({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  const { session } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, type);
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, type);

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
