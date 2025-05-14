import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ResourceList from './resource-list';
import PermissionDetails from './permission-details';
import { resource } from '@/entities/data/access-control';
import { Edit, Eye, Info, Plus, Shield } from 'lucide-react';
import { Separator } from '../ui/separator';

interface AccessControlPanelProps {
  resourceList: resource[];
}

export default function AccessControlPanel({
  resourceList,
}: AccessControlPanelProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <div className="@container">
        <div className="grid gap-4 @5xl:grid-cols-3">
          <ResourceList
            resourceList={resourceList}
            onSelectResource={setSelectedResource}
            selectedResource={selectedResource}
          />
          <Card className="@5xl:col-span-2">
            <CardHeader>
              <CardTitle>Manage Permission</CardTitle>
              <CardDescription>
                {selectedResource ? (
                  <span>
                    Manage agents who can access your{' '}
                    {selectedResource.replace('-', ' ').replace('/', '')}
                  </span>
                ) : (
                  <span>
                    Please select a resource gategory in order to manage it
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid h-full">
              {selectedResource ? (
                <PermissionDetails resourcePath={selectedResource} />
              ) : (
                <div className="grid text-muted-foreground text-sm min-h-[50px]">
                  <p>No resource category selected...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Separator className="my-4" />
      <Card className="border-none p-0">
        <CardHeader className="p-0">
          <CardTitle>Access Levels</CardTitle>
          <CardDescription>
            Understanding the different permission levels and what they allow
            agents to do
          </CardDescription>
          <CardContent className="grid gap-4 p-0 pt-4">
            <div className="flex gap-3 items-start">
              <div className="bg-blue-400/20 dark:bg-blue-400/40 rounded-full p-2 flex items-center justify-center">
                <Eye className="text-blue-400 size-4" />
              </div>
              <div>
                <h3 className="font-bold">Read</h3>
                <p className="text-muted-foreground text-sm">
                  Allows agents to view content in the category
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-green-400/20 dark:bg-green-400/40 rounded-full p-2 flex items-center justify-center">
                <Edit className="text-green-400 size-4" />
              </div>
              <div>
                <h3 className="font-bold">Write</h3>
                <p className="text-muted-foreground text-sm">
                  Allows agents to update and add new data to the category
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-yellow-400/20 dark:bg-yellow-400/40 rounded-full p-2 flex items-center justify-center">
                <Plus className="text-yellow-400 size-4" />
              </div>
              <div>
                <h3 className="font-bold">Append</h3>
                <p className="text-muted-foreground text-sm">
                  Allows agents to add new data to the category
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-purple-400/20 dark:bg-purple-400/40 rounded-full p-2 flex items-center justify-center">
                <Shield className="text-purple-400 size-4" />
              </div>
              <div>
                <h3 className="font-bold">Control</h3>
                <p className="text-muted-foreground text-sm">
                  Allows agents to manage permissions for the category
                </p>
              </div>
            </div>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
