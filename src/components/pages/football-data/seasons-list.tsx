import { useAuth } from '@/context/auth-context';
import { useGetAllSeasonsInfo } from '@/use-cases/football-data';
import { SeasonCard } from './season-card';

export function SeasonsList({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Seasons</h2>
      <SeasonsListInner pod={pod} type={type} />
    </>
  );
}

function SeasonsListInner({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  const { session } = useAuth();
  const {
    data: seasons,
    error,
    isPending,
  } = useGetAllSeasonsInfo(session, pod, type);

  if (isPending) {
    return <SeasonsSkeleton />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (seasons?.length === 0) {
    return <p>No seasons on record</p>;
  }

  return (
    <div className="grid gap-2">
      {seasons?.map((season) => (
        <SeasonCard
          key={`${season.info.season}-${season.info.team}`}
          type={type}
          team={season.info.team}
          season={season.info.season}
          league={season.info.league}
          matches={season.info.matches}
          goals={season.events.goals}
          assists={season.events.assists}
          yellowCards={season.events.yellowCards}
          redCards={season.events.redCards}
        />
      ))}
    </div>
  );
}

function SeasonsSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-[126px] bg-muted rounded-md animate-pulse" />
      ))}
    </div>
  );
}
