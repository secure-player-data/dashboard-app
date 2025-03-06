import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useGetMedicalReports } from '@/use-cases/health-data';
import { FileText } from 'lucide-react';

export default function HealthReports({ playerPod }: { playerPod: string }) {
  const { session } = useAuth();
  const { data, error, isPending } = useGetMedicalReports(session, playerPod);

  if (isPending) {
    return <Skeleton />;
  }

  if (error) {
    return <p>Failed to get reports: {error.message}</p>;
  }

  return (
    <div className="grid gap-4">
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reports on record</p>
      ) : (
        data.map((report) => (
          <Dialog key={report.date.toISOString()}>
            <DialogTrigger asChild className="cursor-pointer">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText />
                    {report.title}
                  </CardTitle>
                  <CardDescription>{report.category}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline">
                    {report.date.toLocaleDateString('en-UK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </Badge>
                </CardFooter>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText />
                  {report.title}
                </DialogTitle>
                <DialogDescription>{report.category}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                {report.content.map((content) => (
                  <div key={content.title}>
                    <Label className="font-semibold">{content.title}</Label>
                    <Textarea readOnly value={content.text} />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="w-full">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[150px] bg-muted rounded-md animate-pulse"
        />
      ))}
    </div>
  );
}
