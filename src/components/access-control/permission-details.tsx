import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useGetPermissionDetails } from '@/use-cases/use-get-permission-details';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { permissionDetail } from '@/entities/data/access-control';
import { paths } from '@/api/paths';
import { useUpdateMembersPermissions } from '@/use-cases/use-update-members-permissions';
import { MemberWithPermissions } from '@/entities/data/member';
import { ButtonWithLoader } from '@/components/ui/button';
import { toast } from 'sonner';

interface PermissionDetailsProps {
  resourcePath: string;
}

type DialogState =
  | { type: 'add' }
  | { type: 'edit'; agent: string; permissions: PermissionSet }
  | { type: 'delete'; agent: string };

type PermissionSet = {
  read: boolean;
  write: boolean;
  append: boolean;
  control: boolean;
};

export default function PermissionDetails({
  resourcePath,
}: PermissionDetailsProps) {
  const { session, pod } = useAuth();
  const fullResourcePath = paths.root(pod!) + '/' + resourcePath;
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string>('');
  const [read, setRead] = useState<boolean>(false);
  const [write, setWrite] = useState<boolean>(false);
  const [append, setAppend] = useState<boolean>(false);
  const [control, setControl] = useState<boolean>(false);

  const { data: permissions, isPending: permissionsPending } =
    useGetPermissionDetails(session, fullResourcePath);

  const { mutate: updateMutation, isPending: deletePending } =
    useUpdateMembersPermissions(session, fullResourcePath);

  const handleAgentName = (agent: string) => {
    if (agent === 'http://www.w3.org/ns/solid/acp#PublicAgent') {
      return 'Public';
    }
    return agent;
  };

  const resetAccesses = () => {
    setRead(false);
    setWrite(false);
    setAppend(false);
    setControl(false);
  };

  const handleAddAgent = () => {
    const memberWithPermissions: MemberWithPermissions[] = [
      {
        webId: activeAgent,
        pod: '',
        name: '',
        role: '',
        permissions: {
          read: read,
          write: write,
          append: append,
          control: control,
        },
      },
    ];
    updateMutation(memberWithPermissions, {
      onSuccess: () => {
        setShowAddDialog(false), toast('Agent was added!');
      },
      onError: () => {
        toast('Whoops something went wrong! Please try again');
      },
    });
    resetAccesses();
  };

  const handleDeletePermissions = () => {
    const memberWithPermissions: MemberWithPermissions[] = [
      {
        webId: activeAgent,
        pod: '',
        name: '',
        role: '',
        permissions: {
          read: false,
          write: false,
          append: false,
          control: false,
        },
      },
    ];
    updateMutation(memberWithPermissions, {
      onSuccess: () => {
        setShowDeleteDialog(false), toast('Agent was deleted');
      },
      onError: () => {
        toast('Whoops something went wrong! Please try again');
      },
    });
    resetAccesses();
  };

  const handleEditPermissions = () => {
    const memberWithPermissions: MemberWithPermissions[] = [
      {
        webId: activeAgent,
        pod: '',
        name: '',
        role: '',
        permissions: {
          read: read,
          write: write,
          append: append,
          control: control,
        },
      },
    ];
    updateMutation(memberWithPermissions, {
      onSuccess: () => {
        setShowEditDialog(false), toast('Agent access was updated!');
      },
      onError: () => {
        toast('Whoops something went wrong! Please try again');
      },
    });
    resetAccesses();
  };

  if (permissionsPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {resourcePath.replace('-', ' ').replace('/', '')}
        </h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Access Permission</DialogTitle>
              <DialogDescription>
                Grant access permissions to an agent for{' '}
                {resourcePath.replace('-', ' ').replace('/', ' ')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="agent">Agent WebID or Group</Label>
                <Input
                  id="agent"
                  onChange={(event) => setActiveAgent(event.target.value)}
                  placeholder="https://example.org/profile/card#me"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read"
                    onCheckedChange={() => {
                      setRead(!read);
                    }}
                  />
                  <Label htmlFor="read">Read</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="write"
                    onCheckedChange={() => {
                      setWrite(!write);
                    }}
                  />
                  <Label htmlFor="write">Write</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    onCheckedChange={() => {
                      setAppend(!append);
                    }}
                  />
                  <Label htmlFor="append">Append</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="control"
                    onCheckedChange={() => {
                      setControl(!control);
                    }}
                  />
                  <Label htmlFor="control">Control</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => handleAddAgent()}>Save Permissions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete agent?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this agent? This will remove any
                access they have to{' '}
                {resourcePath.replace('-', ' ').replace('/', ' ')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <ButtonWithLoader
                onClick={() => handleDeletePermissions()}
                isLoading={deletePending}
              >
                Delete Agent
              </ButtonWithLoader>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Permissions For {activeAgent}</DialogTitle>
              <DialogDescription>
                Update the permissions for an agent.{' '}
                {resourcePath.replace('-', ' ').replace('/', ' ')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="read"
                    disabled={activeAgent == session?.info.webId!}
                    checked={read}
                    onCheckedChange={() => {
                      setRead(!read);
                    }}
                  />
                  <Label htmlFor="read">Read</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="write"
                    disabled={activeAgent == session?.info.webId!}
                    checked={write}
                    onCheckedChange={() => {
                      setWrite(!write);
                    }}
                  />
                  <Label htmlFor="write">Write</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    disabled={activeAgent == session?.info.webId!}
                    checked={append}
                    onCheckedChange={() => {
                      setAppend(!append);
                    }}
                  />
                  <Label htmlFor="append">Append</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="control"
                    disabled={activeAgent == session?.info.webId!}
                    checked={control}
                    onCheckedChange={() => {
                      setControl(!control);
                    }}
                  />
                  <Label htmlFor="control">Control</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <ButtonWithLoader
                onClick={() => handleEditPermissions()}
                isLoading={deletePending}
              >
                Update Access
              </ButtonWithLoader>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Agent</TableHead>
            <TableHead className="text-center">Read</TableHead>
            <TableHead className="text-center">Write</TableHead>
            <TableHead className="text-center">Append</TableHead>
            <TableHead className="text-center">Control</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions!.map((permission: permissionDetail) => (
            <TableRow key={permission.agent}>
              <TableCell className="font-medium">
                <div>
                  <div className="truncate max-w-[250px]">
                    {handleAgentName(permission.agent)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {permission.read ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission.write ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission.append ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission.control ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowEditDialog(!showEditDialog);
                      setActiveAgent(permission.agent);
                      setRead(permission.read);
                      setWrite(permission.write);
                      setAppend(permission.append);
                      setControl(permission.control);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowDeleteDialog(!showDeleteDialog);
                      setActiveAgent(permission.agent);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-sm text-muted-foreground mt-4">
        <p>
          <strong>Read:</strong> View the resource
        </p>
        <p>
          <strong>Write:</strong> Modify or delete the resource
        </p>
        <p>
          <strong>Append:</strong> Add data to the resource but not modify
          existing data
        </p>
        <p>
          <strong>Control:</strong> Change access permissions for the resource
        </p>
      </div>
    </div>
  );
}
