import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
import { HeaderSkeleton } from './header-skeleton';
import { StatCard } from './stat-card';
import {
  BarChart3,
  Calendar,
  Goal,
  ShieldAlert,
  ShieldX,
  Shirt,
  Timer,
  Trophy,
} from 'lucide-react';

export function NationHeader() {
  return (
    <>
      <h2 className="font-bold text-xl mb-4">Overall Stats</h2>
      <NationHeaderInner />
    </>
  );
}

function NationHeaderInner() {
  const { session, pod } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, 'nation');
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, 'nation');

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
