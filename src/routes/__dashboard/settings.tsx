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
import { LogOut, Trash2 } from 'lucide-react';
import LeaveTeamDialog from '@/components/alerts/leave-team-alert';

export const Route = createFileRoute('/__dashboard/settings')({
  component: RouteComponent,
});

const handleLeaveTeam = () => {
  console.log('Tried to leave team');
};
const handleDeleteAccount = () => {
  console.log('Tried to delete account');
};

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

      <Card className="flex items-start justify-between border-red-500">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center flex-col gap-4 pt-6">
          <div className="flex justify-between w-full">
            <p className="text-sm mr-2">Removes you from the team</p>
            <LeaveTeamDialog />
          </div>
          <div className="flex justify-between w-full">
            <p className="text-sm mr-2">
              Delete your account - deletes all information used by this
              application from your pod
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
