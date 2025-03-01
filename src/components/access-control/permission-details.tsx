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
import { ButtonWithLoader } from '@/components/ui/button';
import { toast } from 'sonner';

interface PermissionDetailsProps {
  resourcePath: string;
}

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
  const [showDialog, setShowDialog] = useState<
    'add' | 'edit' | 'delete' | null
  >(null);
  const [activeAgent, setActiveAgent] = useState<string>('');
  const [activePermissions, setActivePermissions] = useState<PermissionSet>({
    read: false,
    write: false,
    append: false,
    control: false,
  });

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
    setActivePermissions({
      read: false,
      write: false,
      append: false,
      control: false,
    });
  };

  const handleDialogSubmission = (action: 'add' | 'edit' | 'delete') => {
    const memberWithPermissions = {
      webId: activeAgent,
      name: '',
      pod: '',
      role: '',
      permissions: {
        read: activePermissions.read,
        write: activePermissions.write,
        append: activePermissions.append,
        control: activePermissions.control,
      },
    };

    let successMessage = 'Access control was successfully granted!';

    if (action === 'delete')
      successMessage =
        'Agent successfully deleted! All permissions have been removed';
    if (action === 'edit')
      successMessage = 'Access controls were changed successfully!';

    updateMutation(memberWithPermissions, {
      onSuccess: () => {
        setShowDialog(null), toast(successMessage);
        resetAccesses();
      },
      onError: () => {
        toast('Whoops! Something something went wrong, please try again!');
      },
    });
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
        <Dialog
          open={showDialog == 'add'}
          onOpenChange={(isOpen) => setShowDialog(isOpen ? 'add' : null)}
        >
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
                      setActivePermissions((prev) => ({
                        ...prev,
                        read: !activePermissions.read,
                      }));
                    }}
                  />
                  <Label htmlFor="read">Read</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="write"
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        write: !activePermissions.write,
                      }));
                    }}
                  />
                  <Label htmlFor="write">Write</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        append: !activePermissions.append,
                      }));
                    }}
                  />
                  <Label htmlFor="append">Append</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="control"
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        control: !activePermissions.control,
                      }));
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
                  setShowDialog(null);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => handleDialogSubmission('add')}>
                Save Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={showDialog === 'delete'}
          onOpenChange={(isOpen) => setShowDialog(isOpen ? 'delete' : null)}
        >
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
                  setShowDialog(null);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <ButtonWithLoader
                onClick={() => handleDialogSubmission('delete')}
                isLoading={deletePending}
              >
                Delete Agent
              </ButtonWithLoader>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={showDialog === 'edit'}
          onOpenChange={(isOpen) => setShowDialog(isOpen ? 'edit' : null)}
        >
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
                    checked={activePermissions.read}
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        read: !activePermissions.read,
                      }));
                    }}
                  />
                  <Label htmlFor="read">Read</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="write"
                    disabled={activeAgent == session?.info.webId!}
                    checked={activePermissions.write}
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        write: !activePermissions.write,
                      }));
                    }}
                  />
                  <Label htmlFor="write">Write</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="append"
                    disabled={activeAgent == session?.info.webId!}
                    checked={activePermissions.append}
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        append: !activePermissions.append,
                      }));
                    }}
                  />
                  <Label htmlFor="append">Append</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="control"
                    disabled={activeAgent == session?.info.webId!}
                    checked={activePermissions.control}
                    onCheckedChange={() => {
                      setActivePermissions((prev) => ({
                        ...prev,
                        control: !activePermissions.control,
                      }));
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
                  setShowDialog(null);
                  resetAccesses();
                }}
              >
                Cancel
              </Button>
              <ButtonWithLoader
                onClick={() => handleDialogSubmission('edit')}
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
                      setShowDialog('edit');
                      setActiveAgent(permission.agent);
                      setActivePermissions({
                        read: permission.read,
                        write: permission.write,
                        append: permission.append,
                        control: permission.control,
                      });
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowDialog('delete');
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
