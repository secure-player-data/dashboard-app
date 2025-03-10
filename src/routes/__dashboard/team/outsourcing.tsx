import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';
import { useGetMembers } from '@/use-cases/use-get-members';
import { useAuth } from '@/context/auth-context';
import { Member } from '@/entities/data/member';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { outsourcePlayerData } from '@/api/access-control/index';
import { NoControlAccessErrors } from '@/exceptions/outsourcing-exception';
import { useGetProfile } from '@/use-cases/use-get-profile';

const dataTypes = [
  {
    id: 'football-data',
    label: 'Football Data',
    description: 'Match statistics, performance metrics, and tactical data',
  },
  {
    id: 'personal-data',
    label: 'Personal Data',
    description: 'Contact information, demographics, and identification',
  },
  {
    id: 'tracking-data',
    label: 'Tracking Data',
    description: 'GPS data, movement patterns, and distance covered',
  },
  {
    id: 'event-data',
    label: 'Event Data',
    description: 'Match events like passes, shots, tackles, and interceptions',
  },
  {
    id: 'biometric-data',
    label: 'Biometric Data',
    description:
      'Physical measurements, body composition, and physiological data',
  },
  {
    id: 'health-data',
    label: 'Health Data',
    description: 'Medical records, injury history, and rehabilitation progress',
  },
];

export const Route = createFileRoute('/__dashboard/team/outsourcing')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [webId, setWebId] = useState('');
  const { session, pod } = useAuth();
  const [failedAccesses, setFailedAccesses] = useState<
    { webid: string; resource: string }[]
  >([]);

  const { data: members, isPending: membersPending } = useGetMembers(
    session,
    pod
  );

  const { data: profile } = useGetProfile(session, pod);

  const handleMemberToggle = (MemberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(MemberId)
        ? prev.filter((id) => id !== MemberId)
        : [...prev, MemberId]
    );
  };

  const handleDataTypeToggle = (dataTypeId: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(dataTypeId)
        ? prev.filter((id) => id !== dataTypeId)
        : [...prev, dataTypeId]
    );
  };

  const handleOutsource = async () => {
    setFailedAccesses([]);
    try {
      await outsourcePlayerData(
        session!,
        profile!,
        pod!,
        members!.filter((member) => selectedMembers.includes(member.webId)),
        selectedDataTypes,
        webId,
        reason
      );
    } catch (error) {
      if (error instanceof NoControlAccessErrors) {
        setFailedAccesses([
          ...error.failedAccesses.map((failedAccess) => ({
            webid: failedAccess.ownerWebId,
            resource: failedAccess.url,
          })),
        ]);
        toast(
          'Failed to outsource resources due to insufficient control access to certain selected resources.'
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleOutsource();
    toast('Outsourcing successful');
  };

  const isValidWebId = (id: string) => {
    try {
      new URL(id);
      return true;
    } catch {
      return false;
    }
  };

  const showMembers = () => {
    if (members) {
      return members.map((member: Member) => (
        <div
          key={'wrapper' + member.webId}
          className={`flex flex-col ${failedAccesses.some((failedAccess) => failedAccess.webid === member.webId) ? 'border border-red-500 p-2 rounded-md' : ''}`}
        >
          <div key={member.webId} className={`flex items-center space-x-2 `}>
            <Checkbox
              id={`Member-${member.webId}`}
              checked={selectedMembers.includes(member.webId)}
              onCheckedChange={() => handleMemberToggle(member.webId)}
            />
            <label
              htmlFor={`Member-${member.webId}`}
              className="flex flex-1 justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {member.name}
              <span className="text-muted-foreground">{member.role}</span>
            </label>
          </div>
          <div
            className={`${failedAccesses.some((failedAccess) => failedAccess.webid === member.webId) ? 'visible text-red-400' : 'hidden'}`}
          >
            Failed to outsource:{' '}
            {failedAccesses
              .filter((failedAccess) => failedAccess.webid === member.webId)
              .map((failedAccess, index) => (
                <span key={index}>
                  {failedAccess.resource}
                  {index <
                    failedAccesses.filter(
                      (failedAccess) => failedAccess.webid === member.webId
                    ).length -
                      1 && ', '}
                </span>
              )) || 'Unknown resource'}
          </div>
        </div>
      ));
    } else if (membersPending) {
      return <Loader2 className="size-4 animate-spin" />;
    } else {
      return <div>No members found</div>;
    }
  };
  return (
    <div className="flex-grow grid content-center @container px-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Members</CardTitle>
              <CardDescription>
                Choose which Members' data you want to share
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">{showMembers()}</div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Data Types</CardTitle>
                <CardDescription>
                  Choose which types of data to share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {dataTypes.map((dataType) => (
                    <div
                      key={dataType.id}
                      className="flex items-start space-x-2"
                    >
                      <Checkbox
                        id={`data-${dataType.id}`}
                        checked={selectedDataTypes.includes(dataType.id)}
                        onCheckedChange={() =>
                          handleDataTypeToggle(dataType.id)
                        }
                        className="mt-1"
                      />
                      <div className="grid gap-1.5">
                        <label
                          htmlFor={`data-${dataType.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dataType.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {dataType.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sharing Details</CardTitle>
                <CardDescription>
                  Provide additional information about this data sharing request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="webid">
                      WebID to Share With
                    </label>
                    <Input
                      id="webid"
                      type="url"
                      placeholder="https://example.com/profile#me"
                      value={webId}
                      onChange={(e) => setWebId(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="reason">
                      Reason for Sharing
                    </label>
                    <Textarea
                      id="reason"
                      placeholder="Explain why you need to share this data..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required={selectedMembers.length > 0}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  <span>All data sharing is logged and audited</span>
                </div>
                <Button
                  type="submit"
                  disabled={
                    selectedMembers.length === 0 ||
                    selectedDataTypes.length === 0 ||
                    (selectedMembers.length > 0 && !reason) ||
                    !isValidWebId(webId)
                  }
                >
                  Outsource
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
