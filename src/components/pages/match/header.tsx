import { useAuth } from '@/context/auth-context';
import { useGetMatchData } from '@/use-cases/football-data';
import { CalendarDays, MapPin } from 'lucide-react';

export function MatchHeader({ matchUrl }: { matchUrl: string }) {
  const { session } = useAuth();
  const { data, error, isPending } = useGetMatchData(session, matchUrl);

  if (isPending) {
    return <MatchHeaderSkeleton />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-around bg-muted rounded-md p-8 mb-2">
        <div className="flex flex-col items-center">
          <img
            src="/placeholder.svg"
            alt={data.home}
            className="w-20 aspect-square rounded-full mb-4"
          />
          <h2 className="font-bold text-xl">{data.home}</h2>
          <p>Home</p>
        </div>
        <h2 className="font-bold text-3xl">
          {data.homeScore} - {data.awayScore}
        </h2>
        <div className="flex flex-col items-center">
          <img
            src="/placeholder.svg"
            alt={data.home}
            className="w-20 aspect-square rounded-full mb-4"
          />
          <h2 className="font-bold text-xl">{data.away}</h2>
          <p>Away</p>
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <p className="flex gap-2 items-center">
          <CalendarDays className="size-4" />{' '}
          {data.date.toLocaleDateString('en-uk', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="flex gap-2 items-center">
          <MapPin className="size-4" /> {data.location}
        </p>
      </div>
    </div>
  );
}

function MatchHeaderSkeleton() {
  return <div className="h-[212px] bg-muted animate-pulse rounded-md"></div>;
}
