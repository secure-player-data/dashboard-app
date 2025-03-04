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
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';

export default function SpeedChart() {
  const chartData = [
    { speed: 0, time: 0 },
    { speed: 12, time: 5 },
    { speed: 9, time: 10 },
    { speed: 15, time: 15 },
    { speed: 20, time: 20 },
    { speed: 18, time: 25 },
    { speed: 22, time: 30 },
    { speed: 10, time: 35 },
    { speed: 18, time: 40 },
    { speed: 15, time: 45 },
    { speed: 10, time: 50 },
    { speed: 18, time: 55 },
    { speed: 15, time: 60 },
    { speed: 10, time: 65 },
    { speed: 18, time: 70 },
    { speed: 15, time: 75 },
    { speed: 10, time: 80 },
    { speed: 18, time: 85 },
    { speed: 15, time: 90 },
  ];
  const chartConfig = {
    desktop: {
      label: 'Desktop',
      color: 'hsl(var(--chart-3))',
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
          <LineChart
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
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="speed"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            >
              <LabelList
                position="top"
                offset={20}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
