import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TrackingData } from '@/entities/data/tracking-data';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function DistanceChart({ data }: { data: TrackingData[] }) {
  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        time: entry.time,
        distance: entry.distance,
      })),
    [data]
  );

  const chartConfig = {
    distance: {
      label: 'Distance',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distance Chart</CardTitle>
        <CardDescription>
          Distance ran over time during the match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}'`}
            />
            <YAxis
              dataKey="distance"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} km`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="distance"
              type="natural"
              fill="var(--color-distance)"
              fillOpacity={0.4}
              stroke="var(--color-distance)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
