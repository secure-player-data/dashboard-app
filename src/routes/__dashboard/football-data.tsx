import { ClubHeader } from '@/components/pages/football-data/club-header';
import { ClubSeasons } from '@/components/pages/football-data/club-seasons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/football-data')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Tabs defaultValue="club">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="club">Club</TabsTrigger>
        <TabsTrigger value="nation">Nation</TabsTrigger>
      </TabsList>
      <TabsContent value="club" className="@container">
        <ClubHeader />
        <ClubSeasons />
      </TabsContent>
    </Tabs>
  );
}
