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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Clock, Info } from 'lucide-react';
import { useGetMembers } from '@/use-cases/use-get-members';
import { useAuth } from '@/context/auth-context';
import { Member } from '@/entities/data/member';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Data types that can be shared
const dataTypes = [
  {
    id: 'football',
    label: 'Football Data',
    description: 'Match statistics, performance metrics, and tactical data',
  },
  {
    id: 'personal',
    label: 'Personal Data',
    description: 'Contact information, demographics, and identification',
  },
  {
    id: 'tracking',
    label: 'Tracking Data',
    description: 'GPS data, movement patterns, and distance covered',
  },
  {
    id: 'event',
    label: 'Event Data',
    description: 'Match events like passes, shots, tackles, and interceptions',
  },
  {
    id: 'biometric',
    label: 'Biometric Data',
    description:
      'Physical measurements, body composition, and physiological data',
  },
  {
    id: 'health',
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
  const [duration, setDuration] = useState('30');
  const [webId, setWebId] = useState('');
  const { session, pod } = useAuth();

  const { data: members, isPending: membersPending } = useGetMembers(
    session,
    pod
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      Members: selectedMembers.map((id) =>
        members!.find((member: Member) => member.webId === id)
      ),
      dataTypes: selectedDataTypes.map((id) =>
        dataTypes.find((d) => d.id === id)
      ),
      reason,
      duration,
      webId,
    });
    // check if member update was successful or not
    toast('Outsourcing successful');
  };

  const resetForm = () => {
    setSelectedMembers([]);
    setSelectedDataTypes([]);
    setReason('');
    setDuration('30');
    setWebId('');
  };

  const isValidWebId = (id: string) => {
    // Basic validation: check if it's a valid URL
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
        <div key={member.webId} className="flex items-center space-x-2">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="duration">
                      Duration (days)
                    </label>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration" className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="14">14 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">365 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
