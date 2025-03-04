import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useGetEventsForMatch } from '@/use-cases/event-data';
import { useGetPersonalData } from '@/use-cases/personal-data';
import {
  CircleSlash,
  Diamond,
  Flag,
  Goal,
  Hand,
  LucideIcon,
  Star,
  TriangleAlert,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, { component: LucideIcon; color: string }> = {
  Goal: {
    component: Goal,
    color: 'text-green-500',
  },
  Assist: {
    component: Star,
    color: 'text-blue-500',
  },
  'Yellow Card': {
    component: Diamond,
    color: 'text-yellow-500',
  },
  'Red Card': {
    component: Diamond,
    color: 'text-red-500',
  },
  Corner: {
    component: Flag,
    color: 'text-amber-700',
  },
  'Free Kick': {
    component: Zap,
    color: 'text-orange-500',
  },
  Penalty: {
    component: CircleSlash,
    color: 'text-red-700',
  },
  'Throw In': {
    component: Hand,
    color: 'text-sky-500',
  },
};

export function EventList({
  pod,
  type,
  season,
  matchId,
}: {
  pod: string;
  type: 'club' | 'nation';
  season: string;
  matchId: string;
}) {
  const { session } = useAuth();
  const { data, error, isPending } = useGetEventsForMatch(
    session,
    pod,
    type,
    season,
    matchId
  );
  const { data: personalData } = useGetPersonalData(session, pod);

  if (isPending) {
    return <EventListSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          All recorded events for {personalData?.name} during this match
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.map((event) => {
          const icon = iconMap[event.event];
          const IconComponent = icon ? icon.component : Goal;
          const color = icon ? icon.color : 'text-green-500';
          return (
            <div
              key={event.time}
              className="grid gap-4"
              style={{ gridTemplateColumns: '50px 1fr' }}
            >
              <div className="flex flex-col items-center">
                <p className="flex items-center justify-center p-2 border rounded-full aspect-square text-sm">
                  {event.time.split(':')[0]}'
                </p>
                <span className="flex-grow w-1 bg-muted"></span>
              </div>
              <div className="flex flex-grow items-center gap-4 p-4 border rounded-md mb-4">
                <IconComponent className={color} />
                <div>
                  <p className="font-semibold">{event.event}</p>
                  <p className="text-sm">Notes: {event.notes || '-'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function EventListSkeleton() {
  return <div></div>;
}
