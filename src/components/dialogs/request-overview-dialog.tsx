import { DataDeletionRequest } from '@/entities/data-info';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Check, Clock, Eye, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';

export function RequestOverviewDialog({ data }: { data: DataDeletionRequest }) {
  function dateToStr(date: Date) {
    return date.toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Eye />
          View details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Details about the deletion request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-8 pb-8">
          <div className="grid gap-4">
            <div>
              <h2 className="font-semibold">Data</h2>
              <p className="text-muted-foreground text-sm">
                List of the data entries that are requested to be deleted
              </p>
            </div>
            <div className="border rounde-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((origin, i) => (
                    <TableRow key={i}>
                      <TableCell>{origin.file}</TableCell>
                      <TableCell>{origin.location}</TableCell>
                      <TableCell>
                        {data.status === 'Requested' ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <Clock className="size-4" /> Requested
                          </Badge>
                        ) : data.status === 'Confirmed' ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <Check className="size-4" /> Confirmed
                          </Badge>
                        ) : (
                          ''
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div className="col-span-2">
              <h2 className="font-semibold">Sender Details</h2>
              <p className="text-muted-foreground text-sm">
                Details about the user that sent the request
              </p>
            </div>
            <div className="flex items-center gap-2">
              <User />
              <div className="flex flex-col">
                <p className="text-muted-foreground text-sm">Name</p>
                <p>{data.sender.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock />
              <div className="flex flex-col">
                <p className="text-muted-foreground text-sm">Date & Time</p>
                <p>{dateToStr(data.sentAt)}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div className="col-span-2">
              <h2 className="font-semibold">Confirmer Details</h2>
              <p className="text-muted-foreground text-sm">
                Details about the user that confirmed the request
              </p>
            </div>
            {!data.confirmer || !data.confirmedAt ? (
              <p className="text-sm col-span-2 text-warning">
                Request has not been confirmed yet...
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <User />
                  <div className="flex flex-col">
                    <p className="text-muted-foreground text-sm">Name</p>
                    <p>{data.confirmer.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock />
                  <div className="flex flex-col">
                    <p className="text-muted-foreground text-sm">Date & Time</p>
                    <p>{dateToStr(data.confirmedAt)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild className="w-full">
            <Button className="w-full">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
