import PlayerHeader from '@/components/headers/player-header';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
  player: z.string(),
});

export const Route = createFileRoute('/__dashboard/__data-page-layout')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { player } = Route.useSearch();

  return (
    <div className="flex flex-col h-full">
      <PlayerHeader playerPod={player} />
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
