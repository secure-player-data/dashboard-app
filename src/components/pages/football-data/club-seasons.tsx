import { useAuth } from '@/context/auth-context';
import { useGetAllSeasonsInfo } from '@/use-cases/football-data';
import { SeasonsSkeleton } from './seasons-skeleton';
import { SeasonCard } from './season-card';

export function ClubSeasons() {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Seasons</h2>
      <ClubSeasonsInner />
    </>
  );
}

function ClubSeasonsInner() {
  const { session, pod } = useAuth();
  const { data: seasons, isPending } = useGetAllSeasonsInfo(
    session,
    pod,
    'club'
  );

  if (isPending) {
    return <SeasonsSkeleton />;
  }

  if (seasons?.length === 0) {
    return <p>No seasons on record</p>;
  }

  return (
    <div className="grid gap-2">
      {seasons?.map((season) => (
        <SeasonCard
          key={season.info.season}
          type="club"
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
