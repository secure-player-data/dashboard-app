import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useGetInjuries } from '@/use-cases/health-data';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock } from 'lucide-react';

const severityColors: Record<string, { bg: string; text: string }> = {
  Minor: {
    bg: 'bg-yellow-200',
    text: 'text-yellow-800',
  },
  Moderate: {
    bg: 'bg-yellow-200',
    text: 'text-yellow-800',
  },
  Severe: {
    bg: 'bg-red-200',
    text: 'text-red-800',
  },
};

export default function Injuries({ player }: { player: string }) {
  const { session } = useAuth();
  const { data, error, isPending } = useGetInjuries(session, player);

  const { minor, moderate, severe } = useMemo(() => {
    if (!data) return { minor: 0, moderate: 0, severe: 0 };

    let minor = 0;
    let moderate = 0;
    let severe = 0;
    data.forEach((injury) => {
      if (injury.severity === 'Minor') {
        minor++;
      } else if (injury.severity === 'Moderate') {
        moderate++;
      } else if (injury.severity === 'Severe') {
        severe++;
      }
    });
    return { minor, moderate, severe };
  }, [data]);

  if (isPending) {
    return <Skeleton />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Injury Summary</CardTitle>
          <CardDescription>Overview of injury history</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
            <p className="font-bold text-xl">{minor}</p>
            <p className="text-sm text-muted-foreground">Minor</p>
          </div>
          <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
            <p className="font-bold text-xl">{moderate}</p>
            <p className="text-sm text-muted-foreground">Moderate</p>
          </div>
          <div className="bg-muted rounded-md flex flex-col items-center justify-center p-4">
            <p className="font-bold text-xl">{severe}</p>
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
            {data.map((injury) => (
              <AccordionItem
                key={injury.date.toISOString()}
                value={injury.date.toISOString()}
              >
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full text-left pr-4">
                    <div className="flex flex-col">
                      <h3 className="font-medium">{injury.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {injury.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={`${severityColors[injury.severity].bg} ${severityColors[injury.severity].text}`}
                      >
                        {injury.severity}
                      </Badge>
                      {dayjs(injury.date)
                        .add(Number(injury.recoveryTime), 'days')
                        .isBefore(dayjs(), 'day') ? (
                        <Badge className="bg-green-200 text-green-800">
                          Recovered
                        </Badge>
                      ) : (
                        <Badge className="bg-red-200 text-red-800">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-1 grid gap-2">
                  <div className="flex items-center justify-between gap-4 bg-muted rounded-md p-2">
                    <p className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      {injury.date.toLocaleDateString('en-UK', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Estimated recovery time: {injury.recoveryTime} days
                    </p>
                  </div>
                  <div>
                    <Label>Description:</Label>
                    <Textarea readOnly>{injury.description}</Textarea>
                  </div>
                  <div>
                    <Label>Treatment:</Label>
                    <Textarea readOnly>{injury.treatment}</Textarea>
                  </div>
                  <div>
                    <Label>Rehabilitation Plan:</Label>
                    <Textarea readOnly>{injury.rehabilitationPlan}</Textarea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-muted rounded-md animate-pulse h-[100px]"
          />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-muted rounded-md animate-pulse h-[100px]"
        />
      ))}
    </div>
  );
}
