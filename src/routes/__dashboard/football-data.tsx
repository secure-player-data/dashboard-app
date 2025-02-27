import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BarChart3,
  Calendar,
  Goal,
  LucideIcon,
  ShieldAlert,
  ShieldX,
  Shirt,
  Timer,
  Trophy,
} from 'lucide-react';

export const Route = createFileRoute('/__dashboard/football-data')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Tabs defaultValue="club">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="club">Club</TabsTrigger>
        <TabsTrigger value="nation">Nation</TabsTrigger>
      </TabsList>
      <TabsContent value="club" className="@container">
        <h2 className="font-bold mb-4 text-xl">Overall Stats</h2>
        <div className="grid gap-4 mb-8 @md:grid-cols-2 @2xl:grid-cols-4">
          <StatCard icon={Calendar} label="Matches Played" value="201" />
          <StatCard icon={Goal} label="Total Goals" value="152" />
          <StatCard icon={Shirt} label="Assists" value="28" />
          <StatCard icon={Timer} label="Minutes Playerd" value="11 875" />
          <StatCard icon={BarChart3} label="Goals per match" value="0.85" />
          <StatCard icon={ShieldAlert} label="Yellow Cards" value="17" />
          <StatCard icon={ShieldX} label="Red Cards" value="7" />
          <StatCard icon={Trophy} label="Trophies" value="3" />
        </div>
        <h2 className="font-bold mb-4 text-xl">Seasons</h2>
        <SeasonCard
          team="Rosenborg"
          season="2025"
          league="Elite serien"
          matches={22}
          goals={15}
          assists={10}
          yellowCards={4}
          redCards={0}
        />
      </TabsContent>
    </Tabs>
  );
}

function StatCard(props: { icon: LucideIcon; label: string; value: string }) {
  return (
    <Card className="flex flex-col p-4">
      <props.icon className="mb-4" />
      <p className="text-sm text-muted-foreground">{props.label}</p>
      <p className="text-3xl font-bold">{props.value}</p>
    </Card>
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
