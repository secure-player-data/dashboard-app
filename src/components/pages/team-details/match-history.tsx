import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const matches = [
  {
    date: 'May 15',
    league: 'League',
    home: 'Rosenborg',
    away: 'Molde',
    score: '3 - 1',
    result: 'Win',
  },
  {
    date: 'May 15',
    league: 'League',
    home: 'Rosenborg',
    away: 'Molde',
    score: '3 - 1',
    result: 'Win',
  },
  {
    date: 'May 15',
    league: 'League',
    home: 'Rosenborg',
    away: 'Molde',
    score: '3 - 1',
    result: 'Win',
  },
  {
    date: 'May 15',
    league: 'League',
    home: 'Rosenborg',
    away: 'Molde',
    score: '3 - 1',
    result: 'Win',
  },
  {
    date: 'May 15',
    league: 'League',
    home: 'Rosenborg',
    away: 'Molde',
    score: '3 - 1',
    result: 'Win',
  },
];

export default function MatchHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8">
          {matches.map((match, index) => (
            <MatchCard key={index} match={match} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex flex-col items-center text-sm gap-1">
        <p>{match.date}</p>
        <Badge variant="outline">{match.league}</Badge>
      </div>
      <div className="grid grid-cols-3 items-center gap-2 text-sm">
        <div className="flex flex-col items-center gap-2">
          <img src="/placeholder.svg" alt="" className="size-8 rounded-md" />
          <p>{match.home}</p>
        </div>
        <p className="text-center font-bold text-xl">{match.score}</p>
        <div className="flex flex-col items-center gap-2">
          <img src="/placeholder.svg" alt="" className="size-8 rounded-md" />
          <p>{match.away}</p>
        </div>
      </div>
      <Badge>{match.result}</Badge>
    </div>
  );
}
