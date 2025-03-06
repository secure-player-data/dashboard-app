import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { Vaccination } from '@/entities/data/health-data';
import { useGetVaccinations } from '@/use-cases/health-data';
import dayjs from 'dayjs';
import { Calendar, CheckCircle2, User, XCircle } from 'lucide-react';
import { useMemo } from 'react';

export default function Vaccinations({ playerPod }: { playerPod: string }) {
  const { session } = useAuth();
  const { data, error, isPending } = useGetVaccinations(session, playerPod);

  if (isPending) {
    return <p>TODO: Skeleton</p>;
  }

  if (error) {
    return <p>Failed to get vaccinations: {error.message}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <VaccinationHeader data={data} />
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Records</CardTitle>
          <CardDescription>
            Complete history of player vaccinatinos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VaccinationTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}

function VaccinationHeader({ data }: { data: Vaccination[] }) {
  const { upToDate, expired } = useMemo(() => {
    let upToDate = 0;
    let expired = 0;
    data.forEach((entry) => {
      const expires = entry.history
        .map((dose) => dose.expirationDate)
        .sort()
        .reverse()[0];

      if (dayjs(expires).isBefore(dayjs(), 'day')) {
        expired++;
      } else {
        upToDate++;
      }
    });

    return { upToDate, expired };
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-l-4 border-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="size-4 text-green-400" /> Up to Date
          </CardTitle>
          <CardDescription>
            Vaccinations that are current and valid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-bold text-3xl">{upToDate}</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-red-400">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <XCircle className="size-4 text-red-400" /> Expired
          </CardTitle>
          <CardDescription>Vaccinations that need renewal</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-bold text-3xl">{expired}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function VaccinationTable({ data }: { data: Vaccination[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vaccination</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Doses</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((vaccination) => (
          <VaccinationRow key={vaccination.name} vaccination={vaccination} />
        ))}
      </TableBody>
    </Table>
  );
}

function VaccinationRow({ vaccination }: { vaccination: Vaccination }) {
  const { date, expiration } = useMemo(() => {
    const date = vaccination.history
      .map((dose) => dose.date)
      .sort()
      .reverse()[0];
    const expiration = vaccination.history
      .map((dose) => dose.expirationDate)
      .sort()
      .reverse()[0];
    return { date, expiration };
  }, [vaccination]);

  return (
    <TableRow>
      <TableCell>{vaccination.name}</TableCell>
      <TableCell>
        {date.toLocaleString('en-UK', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {dayjs(expiration).isBefore(dayjs(), 'day')
            ? 'Expired'
            : 'Up to date'}
        </Badge>
      </TableCell>
      <TableCell>
        {expiration.toLocaleString('en-UK', {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        })}
      </TableCell>
      <TableCell>{vaccination.history.length}</TableCell>
      <TableCell>
        <VaccinationDialog vaccination={vaccination} />
      </TableCell>
    </TableRow>
  );
}

function VaccinationDialog({ vaccination }: { vaccination: Vaccination }) {
  const { date, expiration, provider, batchNumber } = useMemo(() => {
    let index = 0;
    let date = vaccination.history[index].date;

    vaccination.history.forEach((dose, i) => {
      if (dayjs(dose.date).isAfter(dayjs(date))) {
        index = i;
        date = dose.date;
      }
    });

    return {
      date: vaccination.history[index].date,
      expiration: vaccination.history[index].expirationDate,
      provider: vaccination.history[index].provider,
      batchNumber: vaccination.history[index].batchNumber,
    };
  }, [vaccination]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vaccination.name}</DialogTitle>
          <DialogDescription>Vaccination details and history</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Date Administered</Label>
              <p className="flex items-center gap-2">
                <Calendar className="size-4" />
                {date.toLocaleDateString('en-UK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Status</Label>
              <p className="flex items-center gap-2">
                {dayjs(expiration).isBefore(dayjs(), 'day') ? (
                  <>
                    <XCircle className="size-4" />
                    <span>Expired</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Up to date</span>
                  </>
                )}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Expiry Date</Label>
              <p className="flex items-center gap-2">
                <Calendar className="size-4" />
                {expiration.toLocaleDateString('en-UK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div>
              <Label className="font-semibold">Provider</Label>
              <p className="flex items-center gap-2">
                <User className="size-4" />
                {provider}
              </p>
            </div>
          </div>
          <div>
            <Label className="font-semibold">Description</Label>
            <p>{vaccination.description}</p>
          </div>
          <div>
            <Label className="font-semibold">Batch Number</Label>
            <p>{batchNumber}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-semibold">
              Vaccination History ({vaccination.history.length})
            </Label>
            {vaccination.history.map((does) => (
              <div
                key={does.date.toISOString()}
                className="border rounded-md p-2"
              >
                <h3 className="mb-1">
                  {does.date.toLocaleDateString('en-UK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">{does.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
