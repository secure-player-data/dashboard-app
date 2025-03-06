import Injuries from '@/components/pages/health-data/injuries';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { createFileRoute } from '@tanstack/react-router';
import { Activity, FileText, Syringe } from 'lucide-react';

export const Route = createFileRoute(
  '/__dashboard/__data-page-layout/health-data'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { player } = Route.useSearch();

  return (
    <div className="h-full">
      <Tabs defaultValue="injuries">
        <TabsList className="mb-4">
          <TabsTrigger value="injuries">
            <Activity className="size-4 mr-2" />
            Injuries
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="size-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="vaccinations">
            <Syringe className="size-4 mr-2" />
            Vaccinations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="injuries">
          <Injuries player={player} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
