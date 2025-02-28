import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import {
  useGetAllSeasonsInfo,
  useGetSeasonInfo,
} from '@/use-cases/football-data';
import { Link } from '@tanstack/react-router';
import { SeasonsSkeleton } from './seasons-skeleton';

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

  return (
    <div className="grid gap-2">
      {seasons?.map((season) => (
        <SeasonCard
          key={season.info.season}
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
      {seasons?.map((season) => (
        <SeasonCard
          key={season.info.season}
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

function SeasonCard({
  team,
  season,
  league,
  matches,
  goals,
  assists,
  yellowCards,
  redCards,
}: {
  team: string;
  season: string;
  league: string;
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}) {
  const stats = [
    {
      label: 'Matches',
      value: matches,
    },
    {
      label: 'Goals',
      value: goals,
    },
    {
      label: 'Goals per match',
      value: (goals / matches).toFixed(2),
    },
    {
      label: 'Assists',
      value: assists,
    },
    {
      label: 'Yellow Cards',
      value: yellowCards,
    },
    {
      label: 'Red Cards',
      value: redCards,
    },
  ];
  const { pod } = useAuth();
  return (
    <Link
      to="/seasons/$season"
      params={{ season: season }}
      search={{ player: pod ?? '' }}
    >
      <Card className="p-4 hover:scale-[101%] transition-transform">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{season}</p>
            <p className="font-bold text-lg">{team}</p>
          </div>
          <Badge className="py-1">{league}</Badge>
        </div>
        <div className="grid grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}
