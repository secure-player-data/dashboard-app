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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

export default function DistanceChart() {
  const chartData = [
    { distance: 0, time: 0 },
    { distance: 0.3, time: 5 },
    { distance: 0.9, time: 10 },
    { distance: 1.2, time: 15 },
    { distance: 1.8, time: 20 },
    { distance: 2.0, time: 25 },
    { distance: 2.5, time: 30 },
    { distance: 3.5, time: 35 },
    { distance: 4.8, time: 40 },
    { distance: 4.9, time: 45 },
    { distance: 5.2, time: 50 },
    { distance: 5.5, time: 55 },
    { distance: 6.9, time: 60 },
    { distance: 7.0, time: 65 },
    { distance: 7.2, time: 70 },
    { distance: 7.4, time: 75 },
    { distance: 9.1, time: 80 },
    { distance: 10.8, time: 85 },
    { distance: 11.2, time: 90 },
  ];
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
