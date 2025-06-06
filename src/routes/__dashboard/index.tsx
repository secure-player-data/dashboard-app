import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { useGetProfile } from '@/use-cases/profile';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Activity,
  Calendar,
  Fingerprint,
  Info,
  Locate,
  TriangleAlert,
  User,
  Volleyball,
} from 'lucide-react';
import { useMemo } from 'react';

export const Route = createFileRoute('/__dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();

  const { data: profile, isPending } = useGetProfile(session, pod);

  const categories = useMemo(
    () => [
      {
        title: 'Personal Data',
        description: 'Data related to you and your persona',
        icon: User,
        link: '/player/$pod/personal-data',
        params: { pod: pod ?? 'unknown' },
      },
      {
        title: 'Football Data',
        description: 'Data related to football',
        icon: Volleyball,
        link: '/player/$pod/football-data',
        params: { pod: pod ?? 'unknown' },
      },
      {
        title: 'Event Data',
        description: 'Data related to events',
        icon: Calendar,
        link: '/player/$pod/event-data',
        params: { pod: pod ?? 'unknown' },
      },
      {
        title: 'Tracking Data',
        description: 'Data related to tracking',
        icon: Locate,
        link: '/player/$pod/tracking-data',
        params: { pod: pod ?? 'unknown' },
      },
      {
        title: 'Biometric Data',
        description: 'Data related to biometrics',
        icon: Fingerprint,
        link: '/player/$pod/biometric-data',
        params: { pod: pod ?? 'unknown' },
      },
      {
        title: 'Health Data',
        description: 'Data related to health',
        icon: Activity,
        link: '/player/$pod/health-data',
        params: { pod: pod ?? 'uknown' },
      },
    ],
    [pod]
  );

  return (
    <div className="h-full flex flex-col">
      {profile?.team === null && (
        <div className="mb-8 border-2 border-blue-400 bg-blue-400/10 p-4 rounded-md">
          <Info className="mb-2" />
          <h1 className="text-lg font-semibold">No Team Available</h1>
          <p className="text-sm">
            You are currently not assosiated with any team. Go to{' '}
            <Link to="/team/details" className="underline">
              team details
            </Link>{' '}
            to either send a request to join a team or create your own.
          </p>
        </div>
      )}
      {pod && (
        <div className="flex-grow grid content-center @container">
          <h1 className="text-2xl font-semibold mb-4">Your Data</h1>
          <div className="grid grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-3 gap-4 h-full">
            {categories.map((category) => (
              <Link
                to={category.link}
                params={category.params}
                key={category.title}
              >
                <section className="border rounded-md p-4 hover:scale-105 transition-transform">
                  <category.icon className="mb-4" />
                  <h2 className="font-bold">{category.title}</h2>
                  <p className="text-sm">{category.description}</p>
                </section>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
