import { BASE_APP_CONTAINER } from '@/api/paths';
import { EventList } from '@/components/pages/match/event-list';
import { MatchHeader } from '@/components/pages/match/header';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/__dashboard/player/$pod/matches/$match')(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const { pod, match: matchUrl } = Route.useParams();

  const { type, season, matchId } = useMemo(() => {
    let [_, ...parts] = matchUrl.split(`/${BASE_APP_CONTAINER}`);
    parts = parts
      .join('')
      .split('/')
      .filter((part) => part !== '');
    const type: 'club' | 'nation' =
      parts[1] === 'club-data' ? 'club' : 'nation';
    const season = parts[2];
    const matchId = parts[3];
    return { type, season, matchId };
  }, [matchUrl]);

  return (
    <div className="flex flex-col gap-8">
      <MatchHeader matchUrl={matchUrl} />
      <EventList pod={pod} type={type} season={season} matchId={matchId} />
    </div>
  );
}
