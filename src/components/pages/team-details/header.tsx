import DeleteTeamAlert from '@/components/alerts/delete-team-alert';
import EditTeamDialog from '@/components/dialogs/edit-team-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useGetMember } from '@/use-cases/members';
import { useGetProfile } from '@/use-cases/profile';
import { Calendar, Pin, Trophy, Users } from 'lucide-react';

export default function Header() {
  const { session, pod } = useAuth();
  const { data: profile } = useGetProfile(session, pod);
  const { data: member } = useGetMember(session, pod);

  return (
    <Card className="flex items-center gap-4 relative">
      {profile?.team?.img ? (
        <img
          src={profile?.team?.img || '/placeholder.svg'}
          alt="Placeholder"
          className="size-56 rounded-md object-contain"
        />
      ) : (
        <div className="size-56 flex items-center justify-center rounnded-md bg-muted">
          <p className="text-muted-foreground text-lg">{profile?.team?.tag}</p>
        </div>
      )}
      <CardContent>
        {member?.role === 'Owner' && (
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <EditTeamDialog />
            <DeleteTeamAlert />
          </div>
        )}
        <div className="flex flex-col gap-4">
          <h1 className="font-bold text-3xl">{profile?.team?.name}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar />
              <div>
                <p className="font-semibold">Founded</p>
                <p className="text-muted-foreground">
                  {profile?.team?.founded}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pin />
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-muted-foreground">
                  {profile?.team?.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users />
              <div>
                <p className="font-semibold">Squad Size</p>
                <p className="text-muted-foreground">32</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy />
              <div>
                <p className="font-semibold">Championships</p>
                <p className="text-muted-foreground">3 titles</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
