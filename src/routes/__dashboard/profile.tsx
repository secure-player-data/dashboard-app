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
import { useState } from 'react';

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
        .role;

      coach = members.filter((member) => member.role == 'Coach')[0].name;
    }

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
              {profile!.team!.name}
            </p>
            <h3 className="text-xl font-semibold">{profile!.team!.tag}</h3>
          </div>
        </div>
        <p className="text-base">Team Role: {role ?? 'No role'}</p>
        <p className="text-base">Coach: {coach ?? 'No coach in team'}</p>
      </div>
    );
  };

  const showProfileInformation = () => {
    let profileName = 'No Name';
    let profileEmail = 'No Email';
    let profileWebId = 'No WebId';
    let profilePod = 'No Pod';
    let profilePicture = 'No picture';

    if (session) {
      profileWebId = session.info.webId!;
    }

    if (pod) {
      profilePod = pod;
    }

    if (profilePending) {
      return <Skeleton />;
    }

    if (profile) {
      profileName = profile.name;
      profileEmail = profile.email;
      profilePicture = profile.picture;
      console.log(profilePicture);
    }

    return (
      <div className="space-y-4 p-4 border rounded-lg">
        <div className="flex flex-row gap-2">
          <div className="flex items-center space-x-4 ">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profilePicture} alt="Profile picture" />
              <AvatarFallback>TE</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profileName}</h2>
              <p className="text-muted-foreground">{profileEmail}</p>
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
            <Input value={profileWebId} readOnly />
            <Button
              variant="outline"
              onClick={() => copyToClipboard('https://id.inrupt.com/torstein')}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Pod URL</label>
          <div className="flex gap-2">
            <Input value={profilePod} readOnly />
            <Button
              variant="outline"
              onClick={() => copyToClipboard('https://podlink.com/storage')}
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

  const handleLeaveTeam = () => {
    console.log('leaving team');
  };

  const handleDeleteAccount = () => {
    console.log('deleting account');
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {showProfileInformation()}
      <div className="flex flex-row gap-2 justify-evenly">
        {showTeamInformation()}

        <div className="p-4 border rounded-lg border-red-300 w-full">
          <h3 className="text-xl font-semibold mb-4">Danger Zone</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm mr-2">Removes you from the team</p>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleLeaveTeam}
              >
                <LogOut className="mr-2 h-4 w-4" /> Leave Team
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm mr-2">
                Delete your account - deletes all information used by this
                application from your pod
              </p>
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
            </div>
          </div>
        </div>
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
