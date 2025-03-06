import { useAuth } from '@/context/auth-context';
import { useGetPersonalData } from '@/use-cases/personal-data';
import { Badge } from '../ui/badge';
import { Dot } from 'lucide-react';

export default function PlayerHeader({ playerPod }: { playerPod: string }) {
  const { session } = useAuth();
  const { data } = useGetPersonalData(session, playerPod);

  return (
    <div className="flex items-center gap-4 mb-4">
      <img
        src={data?.image || '/placeholder.svg'}
        alt={data?.name}
        className="size-16 rounded-full"
      />
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-xl">{data?.name}</h1>
        <div className="flex items-center text-sm gap-4">
          <Badge variant="outline">{data?.position}</Badge>
          <Dot className="size-4" />
          <p className="text-muted-foreground">{data?.nation}</p>
        </div>
      </div>
    </div>
  );
}
