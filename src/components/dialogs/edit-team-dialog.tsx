import { SquarePen } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import EditTeamForm from '../forms/edit-team-form';
import { useState } from 'react';

export default function EditTeamDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SquarePen className="size-4" />
          Edit Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit team</DialogTitle>
          <DialogDescription>Update your team details</DialogDescription>
        </DialogHeader>
        <EditTeamForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
