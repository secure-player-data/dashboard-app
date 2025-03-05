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
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Injury Summary</CardTitle>
                <CardDescription>Overview of injury history</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
                  <p className="font-bold text-xl">1</p>
                  <p className="text-sm text-muted-foreground">Minor</p>
                </div>
                <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
                  <p className="font-bold text-xl">2</p>
                  <p className="text-sm text-muted-foreground">Moderate</p>
                </div>
                <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
                  <p className="font-bold text-xl">0</p>
                  <p className="text-sm text-muted-foreground">Severe</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Injury History</CardTitle>
                <CardDescription>
                  History over all injuries for the player
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full text-left pr-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium">Hamstring Strain</h3>
                          <p className="text-sm text-muted-foreground">
                            Left Hamstring
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-yellow-200 text-yellow-800">
                            Moderate
                          </Badge>
                          <Badge className="bg-red-200 text-red-800">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>More info</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full text-left pr-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium">Ankle Sprain</h3>
                          <p className="text-sm text-muted-foreground">
                            Right Ankle
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-yellow-200 text-yellow-800">
                            Moderate
                          </Badge>
                          <Badge className="bg-green-200 text-green-800">
                            Recovered
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>More info</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>
                      <div className="flex items-center justify-between w-full text-left pr-4">
                        <div className="flex flex-col">
                          <h3 className="font-medium">Knee Contusion</h3>
                          <p className="text-sm text-muted-foreground">
                            Left Knee
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-200 text-green-800">
                            Minor
                          </Badge>
                          <Badge className="bg-green-200 text-green-800">
                            Recovered
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>More info</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
