import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import LeaveTeamDialog from '@/components/alerts/leave-team-alert';
import { Separator } from '@/components/ui/separator';
import DeleteAccountDialog from '@/components/alerts/delete-account-alert';

export const Route = createFileRoute('/__dashboard/settings')({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="max-w-[80ch] space-y-4">
      <h1 className="font-bold text-3xl">Settings</h1>
      <Card className="flex items-end justify-between">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preffered theme</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center">
          <ModeToggle />
        </CardContent>
      </Card>

      <Card className="flex flex-col items-start justify-between border-red-500">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Actions here are irreverisble and may permanently impact your
            account or data. Proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 w-full">
          <div className="grid grid-cols-3 items-end gap-2 w-full">
            <div className="col-span-2">
              <h2 className="font-semibold text-lg">Leave team</h2>
              <p className="text-sm text-muted-foreground">
                Removes you from the team
              </p>
            </div>
            <LeaveTeamDialog />
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-end gap-2 w-full">
            <div className="col-span-2">
              <h2 className="font-semibold text-lg">Delete account</h2>
              <p className="text-sm text-muted-foreground">
                Deletes all information used by this application from your pod
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
