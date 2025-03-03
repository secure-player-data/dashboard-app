import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { FootballData } from '@/entities/data/football-data';
import { useGetAllMatchesBySeason } from '@/use-cases/football-data';
import { Link } from '@tanstack/react-router';
import { Clock, Pin } from 'lucide-react';

export function SeasonMatches({
  pod,
  season,
  type,
  team, // Team the player was playing for this season
}: {
  pod: string;
  season: string;
  type: 'club' | 'nation';
  team: string;
}) {
  return (
    <div>
      <h2 className="font-bold text-xl mb-4">Matches</h2>
      <SeasonMatchesInner pod={pod} season={season} type={type} team={team} />
    </div>
  );
}

function SeasonMatchesInner({
  pod,
  season,
  type,
  team,
}: {
  pod: string;
  season: string;
  type: 'club' | 'nation';
  team: string;
}) {
  const { session } = useAuth();
  const { data, isPending, error } = useGetAllMatchesBySeason(
    session,
    pod,
    type,
    season
  );

  if (isPending) {
    return <p>TODO: Skeleton</p>;
  }

  if (error) {
    return <p>Failed to fetch matches</p>;
  }

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}
    >
      {data.map((match) => (
        <MatchCard key={match.date.toISOString()} match={match} team={team} />
      ))}
    </div>
  );
}

function MatchCard({ match, team }: { match: FootballData; team: string }) {
  const colors = {
    Victory: {
      bg: 'bg-green-100',
      text: 'text-green-800',
    },
    Defeat: {
      bg: 'bg-red-100',
      text: 'text-red-800',
    },
    Tie: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
    },
  };

  let result: 'Victory' | 'Defeat' | 'Tie';
  if (match.homeScore === match.awayScore) {
    result = 'Tie';
  } else if (match.home === team) {
    if (match.homeScore > match.awayScore) {
      result = 'Victory';
    } else {
      result = 'Defeat';
    }
  } else {
    if (match.awayScore > match.homeScore) {
      result = 'Victory';
    } else {
      result = 'Defeat';
    }
  }

  return (
    <Link to="/matches/$match" params={{ match: match.url }}>
      <Card className="p-4 hover:scale-[101%] transition-transform">
        <div className="mb-4 text-sm">
          <p className="font-semibold">
            {match.date.toLocaleDateString('en-uk', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-muted-foreground">{match.location}</p>
        </div>
        <div className="grid grid-cols-7 justify-center items-center gap-4 mb-4">
          <div className="flex flex-col items-center col-span-3 text-center">
            <p className="font-semibold text-sm">{match.home}</p>
            <p className="font-bold text-2xl">{match.homeScore}</p>
          </div>
          <p className="text-muted-foreground text-center">vs</p>
          <div className="flex flex-col items-center col-span-3 text-center">
            <p className="font-semibold text-sm">{match.away}</p>
            <p className="font-bold text-2xl">{match.awayScore}</p>
          </div>
        </div>
        <div
          className={`${colors[result].bg} ${colors[result].text} text-center p-2`}
        >
          <p>{result}</p>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between">
          <p className="flex items-center">
            <Clock className="size-4 mr-2" />
            <span className="font-semibold mr-1">{match.playTime}</span>
            minutes played
          </p>
          <p className="flex gap-2 items-center">
            <Pin className="size-4" />
            {match.playerPosition}
          </p>
        </div>
      </Card>
    </Link>
  );
}
