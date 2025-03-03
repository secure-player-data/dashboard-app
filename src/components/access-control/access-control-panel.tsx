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

interface AccessControlPanelProps {
  resourceList: resource[];
}

export default function AccessControlPanel({
  resourceList,
}: AccessControlPanelProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ResourceList
        resourceList={resourceList}
        onSelectResource={setSelectedResource}
        selectedResource={selectedResource}
      />
      {selectedResource ? (
        <Card>
          <CardHeader>
            <CardTitle>Access Permissions</CardTitle>
            <CardDescription>
              Manage who has access to{' '}
              {selectedResource.replace('-', ' ').replace('/', '')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PermissionDetails resourcePath={selectedResource} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Access Permissions</CardTitle>
            <CardDescription>
              Select a resource to view its access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No resource selected
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
