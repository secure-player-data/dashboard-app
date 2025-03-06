import Injuries from '@/components/pages/health-data/injuries';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useGetPersonalData } from '@/use-cases/personal-data';
import { AccordionContent } from '@radix-ui/react-accordion';
import { TabsContent } from '@radix-ui/react-tabs';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Activity, Dot, Eye, FileText, Syringe } from 'lucide-react';
import { z } from 'zod';

const searchSchema = z.object({
  player: z.string(),
});

export const Route = createFileRoute('/__dashboard/health-data')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const { session } = useAuth();
  const { player } = Route.useSearch();
  const { data: playerInfo } = useGetPersonalData(session, player);

  return (
    <div className="h-full">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={playerInfo?.image || '/placeholder.svg'}
          alt={playerInfo?.name}
          className="size-16 rounded-full"
        />
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-xl">{playerInfo?.name}</h1>
          <div className="flex items-center text-sm gap-4">
            <Badge variant="outline">{playerInfo?.position}</Badge>
            <Dot className="size-4" />
            <p className="text-muted-foreground">{playerInfo?.nation}</p>
          </div>
        </div>
      </div>
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
