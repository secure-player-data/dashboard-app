import { StatHeader } from '@/components/headers/stat-header';
import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';

export function SeasonHeader({
  pod,
  season,
  type,
}: {
  pod: string;
  season: string;
  type: 'club' | 'nation';
}) {
  return (
    <>
      <h2 className="font-bold text-xl mb-4">Season Stats</h2>
      <SeasonHeaderInner pod={pod} season={season} type={type} />
    </>
  );
}

function SeasonHeaderInner({
  pod,
  season,
  type,
}: {
  pod: string;
  season: string;
  type: 'club' | 'nation';
}) {
  const { session } = useAuth();
  const { data: football } = useGetAggregatedFootballData(
    session,
    pod,
    type,
    season
  );
  const { data: event } = useGetAggregatedEventData(session, pod, type, season);

  return (
    <StatHeader
      footballData={football}
      footballPending={false}
      footballError={null}
      eventData={event}
      eventPending={false}
      eventError={null}
    />
  );
}
