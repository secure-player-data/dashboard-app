import { ClubHeader } from '@/components/pages/football-data/club-header';
import { ClubSeasons } from '@/components/pages/football-data/club-seasons';
import { NationHeader } from '@/components/pages/football-data/nation-header';
import { NationSeasons } from '@/components/pages/football-data/nation-seasons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useGetPersonalData } from '@/use-cases/personal-data';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
  player: z.string(),
});

export const Route = createFileRoute('/__dashboard/football-data')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { session } = useAuth();
  const { player } = Route.useSearch();

  const { data: playerData } = useGetPersonalData(session, player);

  return (
    <>
      <h1 className="font-bold text-3xl mb-4">{playerData?.name}</h1>
      <Tabs defaultValue="club">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="club">Club</TabsTrigger>
          <TabsTrigger value="nation">Nation</TabsTrigger>
        </TabsList>
        <TabsContent value="club" className="@container">
          <ClubHeader />
          <ClubSeasons />
        </TabsContent>
        <TabsContent value="nation" className="@container">
          <NationHeader />
          <NationSeasons />
        </TabsContent>
      </Tabs>
    </>
  );
}
