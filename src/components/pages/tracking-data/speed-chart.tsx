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

export default function SpeedChart({ data }: { data: TrackingData[] }) {
  const chartData = useMemo(
    () =>
      data.map((entry) => ({
        time: entry.time,
        speed: entry.speed,
      })),
    [data]
  );

  const chartConfig = {
    speed: {
      label: 'speed',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed Chart</CardTitle>
        <CardDescription>Speed over time during the match</CardDescription>
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
              dataKey="speed"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} km/h`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="speed"
              type="natural"
              fill="var(--color-speed)"
              fillOpacity={0.4}
              stroke="var(--color-speed)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
