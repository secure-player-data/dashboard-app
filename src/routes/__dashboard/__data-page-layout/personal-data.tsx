import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useGetSeasonInfo } from '@/use-cases/football-data';
import { useGetPersonalData } from '@/use-cases/personal-data';
import { birthdateToAge } from '@/utils';
import { TabsContent } from '@radix-ui/react-tabs';
import { createFileRoute } from '@tanstack/react-router';
import {
  Calendar,
  Flag,
  Footprints,
  Loader2,
  Locate,
  LucideIcon,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Shirt,
  Trophy,
  Users,
  Weight,
} from 'lucide-react';

export const Route = createFileRoute('/__dashboard/__data-page-layout/personal-data')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const { data: player, isPending, error } = useGetPersonalData(session, pod);
  const { data: season } = useGetSeasonInfo(
    session,
    pod,
    'club',
    new Date().getFullYear().toString()
  );

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Card className="flex max-w-[1200px] m-auto">
      <section className="grid md:grid-cols-2">
        {/* Left side */}
        <div className="relative h-full flex items-center justify-center">
          <img
            src={player.image || '/placeholder.svg'}
            alt={player.name}
            className="w-full h-full object-cover rounded-md aspect-square"
          />
          <div className="absolute top-4 right-4">
            <Badge className="px-3 py-1 text-sm font-medium flex items-center gap-2">
              <Flag className="size-4" />
              {player.nation}
            </Badge>
          </div>
        </div>
        {/* Right side */}
        <div className="flex-1 p-6 @container">
          <div className="mb-4">
            <h1 className="text-3xl @md:text-4xl font-bold mb-2">
              {player.name}
            </h1>
            <Badge variant="outline" className="text-sm font-medium">
              {player.position}
            </Badge>
          </div>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span className="font-medium">Current team:</span>
                  <span>{season?.team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="size-4" />
                  <span className="font-medium">League:</span>
                  <span>{season?.league}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <OverviewValue
                  icon={Calendar}
                  label="Age"
                  value={`${birthdateToAge(player.birtdate)} years`}
                />
                <OverviewValue
                  icon={Ruler}
                  label="Height"
                  value={`${player.height} cm`}
                />
                <OverviewValue
                  icon={Weight}
                  label="Weight"
                  value={`${player.weight} kg`}
                />
                <OverviewValue
                  icon={Footprints}
                  label="Dominant Foot"
                  value={player.dominantFoot}
                />
                <OverviewValue
                  icon={Locate}
                  label="Position"
                  value={player.position}
                />
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <DetailsValue
                    icon={Calendar}
                    label="Birth Date"
                    value={player.birtdate.toLocaleDateString('en-UK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  />
                  <DetailsValue
                    icon={MapPin}
                    label="Address"
                    value={player.address}
                  />
                  <DetailsValue
                    icon={Phone}
                    label="Phone"
                    value={player.phone}
                  />
                  <DetailsValue
                    icon={Mail}
                    label="Email"
                    value={player.email}
                  />
                  <DetailsValue
                    icon={Flag}
                    label="Nationality"
                    value={player.nation}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Football Details
                </h3>
                <div className="space-y-2">
                  <DetailsValue
                    icon={Locate}
                    label="Position"
                    value={player.position}
                  />
                  <DetailsValue
                    icon={Shirt}
                    label="Current team"
                    value={season?.team ?? '-'}
                  />
                  <DetailsValue
                    icon={Trophy}
                    label="League"
                    value={season?.league ?? '-'}
                  />
                  <DetailsValue
                    icon={Footprints}
                    label="Dominant Foot"
                    value={player.dominantFoot}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Card>
  );
}

function OverviewValue(props: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-muted p-2 rounded-sm">
        <props.icon className="size-4" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{props.label}</p>
        <p className="font-medium">{props.value}</p>
      </div>
    </div>
  );
}

function DetailsValue(props: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <props.icon className="size-4 text-muted-foreground" />
      <span className="font-medium">{props.label}:</span>
      <span>{props.value}</span>
    </div>
  );
}
