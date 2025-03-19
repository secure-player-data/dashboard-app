import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clipboard, Trash2, LogOut, SquarePen } from 'lucide-react';
import { toast } from 'sonner';
import { useGetProfile } from '@/use-cases/use-get-profile';
import { useGetMembers } from '@/use-cases/use-get-members';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileEditDialog } from '@/components/dialogs/profile-edit-dialog';
import { useMemo, useState } from 'react';

export const Route = createFileRoute('/__dashboard/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: members, isPending: membersPending } = useGetMembers(
    session,
    pod
  );

  const { data: profile, isPending: profilePending } = useGetProfile(
    session,
    pod
  );

  const showTeamInformation = () => {
    let role = '';
    let coach = '';

    if (membersPending) {
      return <Skeleton />;
    }

    if (!members) {
      role = 'No role';
      coach = 'No coach in team';
    } else {
      role = members.filter((member) => member.webId == session!.info.webId)[0]
        ?.role;

      coach = members.filter((member) => member.role == 'Coach')[0]?.name;
    }

    if (!profile?.team) return;

    return (
      <div className="space-y-3 p-4 border rounded-lg w-full">
        <div className="flex items-center space-x-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src="/placeholder.svg?height=80&width=80"
              alt="Team logo"
            />
            <AvatarFallback>RBK</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              {profile?.team?.name}
            </p>
            <h3 className="text-xl font-semibold">{profile?.team?.tag}</h3>
          </div>
        </div>
        <p className="text-base">Team Role: {role ?? 'No role'}</p>
        <p className="text-base">Coach: {coach ?? 'No coach in team'}</p>
      </div>
    );
  };

  const showProfileInformation = () => {
    const initials = useMemo(() => {
      if (!profile) return 'N/A';

      return profile.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }, [profile]);

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex flex-row gap-2">
          <div className="flex items-center space-x-4 ">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.picture} alt="Profile picture" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.name || 'No name'}
              </h2>
              <p className="text-muted-foreground">
                {profile?.email || 'No email'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditDialogOpen(!isEditDialogOpen)}
          >
            <SquarePen />
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">WebID</label>
          <div className="flex gap-2">
            <Input value={session?.info.webId || 'No WebId'} readOnly />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(session?.info.webId || '')}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pod URL</label>
          <div className="flex gap-2">
            <Input value={pod || 'No pod'} readOnly />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(pod || '')}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {showProfileInformation()}
      <div className="flex flex-row gap-2 justify-evenly">
        {showTeamInformation()}
      </div>
      {profile && (
        <ProfileEditDialog
          session={session!}
          pod={pod!}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={profile}
        />
      )}
    </div>
  );
}
