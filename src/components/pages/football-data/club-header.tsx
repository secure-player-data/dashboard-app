import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
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
import { HeaderSkeleton } from './header-skeleton';

export function ClubHeader() {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Overall Stats</h2>
      <ClubHeaderInner />
    </>
  );
}

function ClubHeaderInner() {
  const { session, pod } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, 'club');
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, 'club');

  if (footballPending || eventPending) {
    return <HeaderSkeleton />;
  }

  if (footballError || eventError) {
    return <p className="mb-8">Failed to load data. Please try again</p>;
  }

  return (
    <>
      <div className="grid gap-4 mb-8 @md:grid-cols-2 @2xl:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Matches Played"
          value={`${football?.matches}`}
        />
        <StatCard icon={Goal} label="Total Goals" value={`${event?.goals}`} />
        <StatCard icon={Shirt} label="Assists" value={`${event?.assists}`} />
        <StatCard
          icon={Timer}
          label="Minutes Playerd"
          value={`${football?.minutesPlayed}`}
        />
        <StatCard
          icon={BarChart3}
          label="Goals per match"
          value={`${((event?.goals ?? 0) / (football?.matches ?? 1)).toFixed(2)}`}
        />
        <StatCard
          icon={ShieldAlert}
          label="Yellow Cards"
          value={`${event?.yellowCards}`}
        />
        <StatCard
          icon={ShieldX}
          label="Red Cards"
          value={`${event?.redCards}`}
        />
        <StatCard
          icon={Trophy}
          label="Trophies"
          value={`${event?.throphies}`}
        />
      </div>
    </>
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
