import { EventAggregation } from '@/entities/data/event-data';
import { FootballAggregation } from '@/entities/data/football-data';
import { HeaderSkeleton } from './header-skeleton';
import { StatCard } from '../cards/stat-card';
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

export function StatHeader({
  footballData,
  footballPending,
  footballError,
  eventData,
  eventPending,
  eventError,
}: {
  footballData: FootballAggregation | undefined;
  footballPending: boolean;
  footballError: Error | null;
  eventData: EventAggregation | undefined;
  eventPending: boolean;
  eventError: Error | null;
}) {
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
          value={`${footballData?.matches}`}
        />
        <StatCard
          icon={Goal}
          label="Total Goals"
          value={`${eventData?.goals}`}
        />
        <StatCard
          icon={Shirt}
          label="Assists"
          value={`${eventData?.assists}`}
        />
        <StatCard
          icon={Timer}
          label="Minutes Playerd"
          value={`${footballData?.minutesPlayed}`}
        />
        <StatCard
          icon={BarChart3}
          label="Goals per match"
          value={`${((eventData?.goals ?? 0) / (footballData?.matches ?? 1)).toFixed(2)}`}
        />
        <StatCard
          icon={ShieldAlert}
          label="Yellow Cards"
          value={`${eventData?.yellowCards}`}
        />
        <StatCard
          icon={ShieldX}
          label="Red Cards"
          value={`${eventData?.redCards}`}
        />
        <StatCard
          icon={Trophy}
          label="Trophies"
          value={`${eventData?.throphies}`}
        />
      </div>
    </>
  );
}
