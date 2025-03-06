import DistanceChart from '@/components/pages/tracking-data/distance-chart';
import Heatmap from '@/components/pages/tracking-data/heatmap';
import PerformanceSummary from '@/components/pages/tracking-data/performance-summary';
import SpeedChart from '@/components/pages/tracking-data/speed-chart';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import {
  useGetAllMatchesForSeasonWithTracking,
  useGetAllSeasonsWithTracking,
  useGetTrackingData,
} from '@/use-cases/tracking-data';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute(
  '/__dashboard/__data-page-layout/tracking-data'
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');

  const { session } = useAuth();
  const { player } = Route.useSearch();
  const { data: seasons } = useGetAllSeasonsWithTracking(
    session,
    player,
    selectedType
  );
  const { data: matches } = useGetAllMatchesForSeasonWithTracking(
    session,
    selectedSeason
  );

  function handleTypeChange(type: string) {
    setSelectedType(type);
    setSelectedSeason('');
    setSelectedSession('');
  }

  function handleSeasonChange(season: string) {
    setSelectedSeason(season);
    setSelectedSession('');
  }

  return (
    <div className="flex flex-col gap-4 h-full @container">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        <div className="min-w-[200px]">
          <Label>Session type</Label>
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="matches">Matches</SelectItem>
              <SelectItem value="training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedType && (
          <div className="min-w-[200px]">
            <Label>Season</Label>
            <Select value={selectedSeason} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {seasons?.length === 0 ? (
                    <SelectLabel>No available seasons</SelectLabel>
                  ) : (
                    seasons?.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season
                          .split('/')
                          .filter((p) => p !== '')
                          .pop()}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
        {selectedSeason && (
          <div className="min-w-[200px]">
            <Label>Session</Label>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {matches?.length === 0 ? (
                    <SelectLabel>No available matches</SelectLabel>
                  ) : (
                    matches?.map((match) => (
                      <SelectItem key={match.url} value={match.url}>
                        {match.date.toLocaleDateString('en-UK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <PageBody selectedSession={selectedSession} />
    </div>
  );
}

function PageBody({ selectedSession }: { selectedSession: string }) {
  const { session } = useAuth();
  const { data, isFetching, error } = useGetTrackingData(
    session,
    selectedSession
  );

  if (selectedSession === '') {
    return (
      <div className="flex-grow flex items-center justify-center bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">
          Please select a specific session to view its data
        </p>
      </div>
    );
  }

  if (isFetching) {
    <div className="flex-grow flex items-center justify-center bg-muted rounded-md">
      <p className="text-sm text-muted-foreground">Crunching the numbers...</p>
    </div>;
  }

  if (error) {
    <div className="flex-grow flex items-center justify-center bg-muted rounded-md">
      <p className="text-sm text-muted-foreground">
        Something went wrong: {error.message}
      </p>
    </div>;
  }

  if (data) {
    return (
      <>
        <PerformanceSummary data={data} />
        <div className="grid @lg:grid-cols-2 gap-4">
          <SpeedChart data={data} />
          <DistanceChart data={data} />
          <div className="@lg:col-span-2">
            <Heatmap data={data} />
          </div>
        </div>
      </>
    );
  }
}
