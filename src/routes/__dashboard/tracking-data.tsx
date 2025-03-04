import DistanceChart from '@/components/pages/tracking-data/distance-chart';
import SpeedChart from '@/components/pages/tracking-data/speed-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Ruler, Timer } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

const searchSchema = z.object({
  player: z.string(),
});

export const Route = createFileRoute('/__dashboard/tracking-data')({
  component: RouteComponent,
  validateSearch: zodValidator(searchSchema),
});

function RouteComponent() {
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(
    undefined
  );
  const [selectedMatch, setSelectedMatch] = useState<string | undefined>(
    undefined
  );

  function handleSeasonChange(season: string) {
    setSelectedSeason(season);
    setSelectedMatch(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="min-w-[200px]">
          <Label>Season</Label>
          <Select value={selectedSeason} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedSeason && (
          <div className="min-w-[200px]">
            <Label>Match</Label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Match 1">Match 1</SelectItem>
                <SelectItem value="Match 2">Match 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Key metrics from the selected session
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center bg-muted rounded-md p-4">
            <Timer className="mb-2" />
            <p className="text-muted-foreground text-sm">Top Speed</p>
            <p className="font-bold text-xl">32 km/h</p>
          </div>
          <div className="flex flex-col items-center bg-muted rounde-md p-4">
            <Ruler className="mb-2" />
            <p className="text-muted-foreground text-sm">Distance</p>
            <p className="font-bold text-xl">11.2 km</p>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="speed" className="w-full pb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="speed">Speed</TabsTrigger>
          <TabsTrigger value="distance">Distance</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
        </TabsList>
        <TabsContent value="speed">
          <SpeedChart />
        </TabsContent>
        <TabsContent value="distance">
          <DistanceChart />
        </TabsContent>
        <TabsContent value="heatmap"></TabsContent>
      </Tabs>
    </div>
  );
}
