import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, FileText, Lock, Globe, Users } from 'lucide-react';
import { resource } from '@/entities/data/access-control';

interface ResourceListProps {
  resourceList: resource[];
  onSelectResource: (resource: string) => void;
  selectedResource: string | null;
}

export default function ResourceList({
  resourceList,
  onSelectResource,
  selectedResource,
}: ResourceListProps) {
  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />;
      case 'private':
        return <Lock className="h-4 w-4 text-red-500" />;
      case 'shared':
        return <Users className="h-4 w-4 text-blue-500" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getAccessBadge = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Public
          </Badge>
        );
      case 'private':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Private
          </Badge>
        );
      case 'shared':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Shared
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pod Resources</CardTitle>
        <CardDescription>
          Select a resource to view its access permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {resourceList.map((resource) => (
            <div
              key={resource.path}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                selectedResource === resource.path
                  ? 'bg-muted border-primary'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectResource(resource.path)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {resource.type === 'folder' ? (
                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm truncate max-w-[150px]">
                    {resource.path.replace('-', ' ').replace('/', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getAccessIcon(resource.accessLevel)}
                  {getAccessBadge(resource.accessLevel)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
