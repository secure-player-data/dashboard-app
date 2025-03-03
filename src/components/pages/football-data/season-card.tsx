import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Link } from '@tanstack/react-router';

export function SeasonCard({
  type,
  team,
  season,
  league,
  matches,
  goals,
  assists,
  yellowCards,
  redCards,
}: {
  type: 'club' | 'nation';
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
      search={{ player: pod ?? '', type }}
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
            <div key={`${season}-${stat.label}`}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}
