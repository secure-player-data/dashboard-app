import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useGetEventsForMatch } from '@/use-cases/event-data';
import { Goal, TriangleAlert } from 'lucide-react';

const iconMap = {
  Goal: Goal,
  Assist: Goal,
  'Yello Card': TriangleAlert,
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
        <CardDescription>All events recorded for $player</CardDescription>
      </CardHeader>
      <CardContent>
        {data.map((event) => (
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
              <Goal />
              <div>
                <p className="font-semibold">{event.event}</p>
                <p className="text-sm">Notes: {event.notes || '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EventListSkeleton() {
  return <div></div>;
}
