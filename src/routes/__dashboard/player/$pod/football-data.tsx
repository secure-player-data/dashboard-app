import EventOverview from '@/components/headers/event-overview';
import { SeasonsList } from '@/components/pages/football-data/seasons-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/__dashboard/player/$pod/football-data')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pod } = Route.useParams();

  return (
    <Tabs defaultValue="club">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="club">Club</TabsTrigger>
        <TabsTrigger value="nation">Nation</TabsTrigger>
      </TabsList>
      <TabsContent value="club" className="@container">
        <EventOverview pod={pod} type="club" />
        <SeasonsList pod={pod} type="club" />
      </TabsContent>
      <TabsContent value="nation" className="@container">
        <EventOverview pod={pod} type="nation" />
        <SeasonsList pod={pod} type="nation" />
      </TabsContent>
    </Tabs>
  );
}
