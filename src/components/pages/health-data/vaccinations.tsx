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
import {
  Calendar,
  CheckCircle2,
  CircleCheck,
  User,
  XCircle,
} from 'lucide-react';

export default function Vaccinations() {
  return (
    <div className="flex flex-col gap-4">
      <VaccinationHeader />
      <Card>
        <CardHeader>
          <CardTitle>Vaccination Records</CardTitle>
          <CardDescription>
            Complete history of player vaccinatinos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VaccinationTable />
        </CardContent>
      </Card>
    </div>
  );
}

function VaccinationHeader() {
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
          <p className="font-bold text-3xl">4</p>
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
          <p className="font-bold text-3xl">1</p>
        </CardContent>
      </Card>
    </div>
  );
}

function VaccinationTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vaccination</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Influenze (Seasonal Flue)</TableCell>
          <TableCell>10/15/2024</TableCell>
          <TableCell>
            <Badge variant="outline">Up to date</Badge>
          </TableCell>
          <TableCell>10/15/2025</TableCell>
          <TableCell>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">View</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Influenze (Seasonal Flu)</DialogTitle>
                  <DialogDescription>
                    Vaccination details and history
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-semibold">Date Administered</Label>
                      <p className="flex items-center gap-2">
                        <Calendar className="size-4" /> 10/15/2024
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Status</Label>
                      <p className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" /> Up to date
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Expiry Date</Label>
                      <p className="flex items-center gap-2">
                        <Calendar className="size-4" /> 10/15/2025
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold">Provider</Label>
                      <p className="flex items-center gap-2">
                        <User className="size-4" /> Team Medical Staff
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Description</Label>
                    <p>Annual influenza vaccination</p>
                  </div>
                  <div>
                    <Label className="font-semibold">Batch Number</Label>
                    <p>FL24-78932</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="font-semibold">Vaccination History</Label>
                    <div className="border rounded-md p-2">
                      <h3 className="mb-1">10/15/2024</h3>
                      <p className="text-sm text-muted-foreground">
                        No adverse reactions
                      </p>
                    </div>
                    <div className="border rounded-md p-2">
                      <h3 className="mb-1">10/15/2023</h3>
                      <p className="text-sm text-muted-foreground">
                        No adverse reactions
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
