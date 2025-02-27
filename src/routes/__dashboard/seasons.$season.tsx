import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';

const searchSchema = z.object({
  player: z.string(),
});

export const Route = createFileRoute('/__dashboard/seasons/$season')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { season } = Route.useParams();
  const { player } = Route.useSearch();

  return (
    <div>
      <p>
        Not yet implemented: Trying to view season {season} stats of player{' '}
        {player}
      </p>
    </div>
  );
}
