import { useAuth } from '@/context/auth-context';
import { useGetAggregatedEventData } from '@/use-cases/event-data';
import { useGetAggregatedFootballData } from '@/use-cases/football-data';
import { useMemo } from 'react';
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

export default function EventOverview({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  return (
    <>
      <h2 className="font-bold mb-4 text-xl">Overall Stats</h2>
      <EventOverviewInner pod={pod} type={type} />
    </>
  );
}

function EventOverviewInner({
  pod,
  type,
}: {
  pod: string;
  type: 'club' | 'nation';
}) {
  const { session } = useAuth();
  const {
    data: football,
    isPending: footballPending,
    error: footballError,
  } = useGetAggregatedFootballData(session, pod, type);
  const {
    data: event,
    isPending: eventPending,
    error: eventError,
  } = useGetAggregatedEventData(session, pod, type);

  const goalsPerMatch = useMemo(() => {
    if (!event?.goals || !football?.matches) return 0;

    return (event.goals / football.matches).toFixed(2);
  }, [event, football]);

  if (footballPending || eventPending) {
    return <Skeleton />;
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
          value={`${goalsPerMatch}`}
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

function Skeleton() {
  return (
    <>
      <div className="grid gap-4 mb-8 @md:grid-cols-2 @2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[130px] bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    </>
  );
}
