import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import { SeasonHeader } from '@/components/pages/season/season-header';
import { SeasonMatches } from '@/components/pages/season/season-matches';
import { useGetSeasonInfo } from '@/use-cases/football-data';
import { useAuth } from '@/context/auth-context';

const searchSchema = z.object({
  player: z.string(),
  type: z.enum(['club', 'nation']),
});

export const Route = createFileRoute('/__dashboard/seasons/$season')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { season } = Route.useParams();
  const { player, type } = Route.useSearch();
  const { session } = useAuth();

  const { data: info } = useGetSeasonInfo(session, player, type, season);

  return (
    <div className="@container">
      <SeasonHeader pod={player} season={season} type={type} />
      <SeasonMatches
        pod={player}
        season={season}
        type={type}
        team={info?.team ?? ''}
      />
    </div>
  );
}
