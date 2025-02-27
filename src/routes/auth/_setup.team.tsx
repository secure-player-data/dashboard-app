import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import JoinTeamForm from '@/components/forms/join-team-form';
import CreateTeamForm from '@/components/forms/create-team-form';

export const Route = createFileRoute('/auth/_setup/team')({
  component: RouteComponent,
});

enum TAB_VALUE {
  JoinTeam = 'join-team',
  CreateTeam = 'create-team',
}

function RouteComponent() {
  const [tabValue, setTabValue] = useState<TAB_VALUE>(TAB_VALUE.JoinTeam);

  return (
    <Card className="w-[600px] m-auto mt-10">
      <CardHeader>
        <CardTitle>Team Setup</CardTitle>
        <CardDescription>Join or create a team</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={tabValue}
          onValueChange={(v) => setTabValue(v as TAB_VALUE)}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TAB_VALUE.JoinTeam}>Join team</TabsTrigger>
            <TabsTrigger value={TAB_VALUE.CreateTeam}>Create team</TabsTrigger>
          </TabsList>
          <TabsContent
            value={TAB_VALUE.JoinTeam}
            className="flex flex-col gap-4"
          >
            <JoinTeamForm />
          </TabsContent>
          <TabsContent value={TAB_VALUE.CreateTeam}>
            <CreateTeamForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
