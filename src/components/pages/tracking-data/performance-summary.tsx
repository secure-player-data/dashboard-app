import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrackingData } from '@/entities/data/tracking-data';
import { Ruler, Timer } from 'lucide-react';
import { useMemo } from 'react';

export default function PerformanceSummary({ data }: { data: TrackingData[] }) {
  const topSpeed = useMemo(
    () => Math.max(...data.map((entry) => entry.speed)),
    [data]
  );
  const totalDistance = useMemo(() => data[data.length - 1].distance, [data]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Summary</CardTitle>
        <CardDescription>Key metrics from the selected session</CardDescription>
      </CardHeader>
      <CardContent className="grid @lg:grid-cols-2 gap-4">
        <div className="flex flex-col items-center bg-muted rounded-md p-4">
          <Timer className="mb-2" />
          <p className="text-muted-foreground text-sm">Top Speed</p>
          <p className="font-bold text-xl">{topSpeed} km/h</p>
        </div>
        <div className="flex flex-col items-center bg-muted rounde-md p-4">
          <Ruler className="mb-2" />
          <p className="text-muted-foreground text-sm">Distance</p>
          <p className="font-bold text-xl">{totalDistance} km</p>
        </div>
      </CardContent>
    </Card>
  );
}
