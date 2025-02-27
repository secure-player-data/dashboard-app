import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createFileRoute, Link } from '@tanstack/react-router';
import { link } from 'fs';
import {
  Activity,
  Calendar,
  Fingerprint,
  Locate,
  User,
  Volleyball,
} from 'lucide-react';

export const Route = createFileRoute('/__dashboard/')({
  component: RouteComponent,
});

function RouteComponent() {
  const categories = [
    {
      title: 'Personal Data',
      description: 'Data related to you and your persona',
      icon: User,
      link: '/personal-data',
    },
    {
      title: 'Football Data',
      description: 'Data related to football',
      icon: Volleyball,
      link: '/football-data',
    },
    {
      title: 'Event Data',
      description: 'Data related to events',
      icon: Calendar,
      link: '/event-data',
    },
    {
      title: 'Tracking Data',
      description: 'Data related to tracking',
      icon: Locate,
      link: '/tracking-data',
    },
    {
      title: 'Biometric Data',
      description: 'Data related to biometrics',
      icon: Fingerprint,
      link: '/biometric-data',
    },
    {
      title: 'Health Data',
      description: 'Data related to health',
      icon: Activity,
      link: '/health-data',
    },
  ];

  return (
    <div className="grid content-center max-w-[1000px] mx-auto @container">
      <h1 className="text-2xl font-semibold mb-4">Your Data</h1>
      <div className="grid grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-3 gap-4 h-full">
        {categories.map((category) => (
          <Link to={category.link} key={category.title}>
            <section className="border rounded-md p-4 hover:scale-105 transition-transform">
              <category.icon className="mb-4" />
              <h2 className="font-bold">{category.title}</h2>
              <p className="text-sm">{category.description}</p>
            </section>
          </Link>
        ))}
      </div>
    </div>
  );
}
