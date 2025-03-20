import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { Button, ButtonWithLoader } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Input } from '@/components/ui/input';
import { useGetMembers } from '@/use-cases/use-get-members';
import { useAuth } from '@/context/auth-context';
import { Member } from '@/entities/data/member';
import { Loader2 } from 'lucide-react';
import { outsourcePlayerData } from '@/api/access-control/index';
import { useGetProfile } from '@/use-cases/use-get-profile';
import { useOutsourceData } from '@/use-cases/use-outsource-data';
import { toast } from 'sonner';

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

  type outsourceResult = {
    failed: { owner: Member; urls: string[] }[];
    successful: { owner: Member; urls: string[] }[];
  };
  const [accesses, setAccesses] = useState<outsourceResult | null>(null);
  const { data: members, isPending: membersPending } = useGetMembers(
    session,
    pod
  );

  const { data: profile } = useGetProfile(session, pod);
  const outsourceMutation = useOutsourceData(session, pod);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    outsourceMutation.mutate(
      {
        profile: profile!,
        dataOwners: members!.filter((member: Member) =>
          selectedMembers.includes(member.webId)
        ),
        resourceUrls: selectedDataTypes,
        dataReceiver: webId,
        reason: reason,
      },
      {
        onError: (error) => toast.error(`An error occured:  ${error.message}`),
        onSuccess: (data) =>
          setAccesses({ failed: data.failed, successful: data.successful }),
      }
    );
  };

  const isValidWebId = (id: string) => {
    try {
      new URL(id);
      return true;
    } catch {
      return false;
    }
  };

  const getAmountOfItems = (result: { owner: Member; urls: string[] }[]) => {
    let total = 0;
    result.map((item) => (total += item.urls.length));
    return total;
  };

  const showMembers = () => {
    if (members) {
      return members.map((member: Member) => (
        <div key={'wrapper' + member.webId} className={`flex flex-col `}>
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
        </div>
      ));
    } else if (membersPending) {
      return <Loader2 className="size-4 animate-spin" />;
    } else {
      return <div>No members found</div>;
    }
  };
  return (
    <div className="flex flex-col gap-6 px-6">
      <div className="flex-grow grid content-center @container ">
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
                    Provide additional information about this data sharing
                    request
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
                  <ButtonWithLoader
                    isLoading={outsourceMutation.isPending}
                    type="submit"
                    disabled={
                      selectedMembers.length === 0 ||
                      selectedDataTypes.length === 0 ||
                      (selectedMembers.length > 0 && !reason) ||
                      !isValidWebId(webId)
                    }
                  >
                    Outsource
                  </ButtonWithLoader>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
      {accesses && accesses.failed && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Outsourcing Results</h2>
            <Button variant="outline" onClick={() => setAccesses(null)}>
              Clear Results
            </Button>
          </div>
          <div className="flex flex-row gap-6">
            {accesses?.successful.length > 0 && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription>
                  Successfully outsourced{' '}
                  {getAmountOfItems(accesses.successful)} items on{' '}
                  {accesses.successful.length} member
                </AlertDescription>
                <ScrollArea className="h-[200px] mt-2 pr-4">
                  <div className="space-y-2">
                    {accesses.successful.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center"
                      >
                        <Info className="h-4 w-4 text-green-600 mr-2" />
                        <span>
                          <strong>{item.owner.name}</strong>:{' '}
                          {item.urls.map((url) => (
                            <div>- {url}</div>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Alert>
            )}
            {accesses.failed.length > 0 && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-600">Failed</AlertTitle>
                <AlertDescription>
                  Failed to outsource {getAmountOfItems(accesses.failed)} items
                  on {accesses.failed.length} member due to access restrictions
                </AlertDescription>
                <ScrollArea className="mt-2 pr-4">
                  <div className="space-y-2">
                    {accesses.failed.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center"
                      >
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        <span>
                          <strong>{item.owner.name}</strong>:{' '}
                          {item.urls.map((url) => (
                            <div>- Insufficient access: {url}</div>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
