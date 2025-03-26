import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { DataInfo } from '@/entities/data-info';
import { useGetData } from '@/use-cases/data';
import { useGetProfile } from '@/use-cases/profile';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Calendar,
  ExternalLink,
  Grid,
  List,
  Loader2,
  Locate,
  MessageSquareMore,
  Play,
  User,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/__dashboard/player/$pod/$category')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pod, category } = Route.useParams();
  const { session } = useAuth();
  const { data: profile } = useGetProfile(session, pod);

  const [layout, setLayout] = useState<'grid' | 'list'>('list');

  function convertCategoryToTitle(category: string) {
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex-row justify-between">
        <div>
          <CardTitle>{convertCategoryToTitle(category)}</CardTitle>
          <CardDescription>
            Viewing {convertCategoryToTitle(category)} for {profile?.name}
          </CardDescription>
        </div>
        <div>
          <Button
            variant="outline"
            className={`rounded-r-none ${layout === 'list' ? 'bg-muted' : ''}`}
            onClick={() => setLayout('list')}
          >
            <List className="size-4" />
          </Button>
          <Button
            variant="outline"
            className={`rounded-l-none ${layout === 'grid' ? 'bg-muted' : ''}`}
            onClick={() => setLayout('grid')}
          >
            <Grid className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LayoutWrapper layoutType={layout} name={profile?.name ?? ''} />
      </CardContent>
    </Card>
  );
}

function LayoutWrapper({
  layoutType,
  name,
}: {
  layoutType: 'grid' | 'list';
  name: string;
}) {
  const { pod, category } = Route.useParams();
  const { session } = useAuth();
  const { data, isPending, error } = useGetData(session, pod, category);

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (data.length === 0) {
    return <p className="text-muted-foreground">No data available...</p>;
  }

  if (layoutType === 'grid') {
    return <GridLayout data={data} />;
  }

  if (layoutType === 'list') {
    return <ListLayout data={data} category={category} name={name} />;
  }
}

function GridLayout({ data }: { data: DataInfo[] }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr)' }}
    >
      {data.map((item) => (
        <div key={item.id} className="space-y-4 border rounded-md p-4">
          <div className="grid gap-4 grid-cols-2">
            <div className="flex items-center gap-2">
              <User />
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground">
                  Uploader
                </Label>
                <p>{item.uploader.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar />
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground">
                  Uploaded at
                </Label>
                <p>
                  {item.uploadedAt.toLocaleDateString('en-UK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Locate />
              <div className="flex flex-col">
                <Label className="text-xs text-muted-foreground">
                  Data origin
                </Label>
                <p>{item.location}</p>
              </div>
            </div>
            <Link
              to="/file/$url"
              params={{ url: item.file.url }}
              search={{ name: item.file.name }}
              className="flex items-center gap-2"
            >
              <ExternalLink /> View data
            </Link>
          </div>
          <div>
            <Label htmlFor="reason" className="text-xs text-muted-foreground">
              Reason
            </Label>
            <Textarea id="reason" value={item.reason} readOnly />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListLayout({
  data,
  category,
  name,
}: {
  data: DataInfo[];
  category: string;
  name: string;
}) {
  return (
    <Table>
      <TableCaption>
        Uploaded {category} for {name}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>
            <div className="flex items-center gap-2">
              <User className="size-4" />
              Uploaded by
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              Uploaded at
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <Locate className="size-4" />
              Location
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <MessageSquareMore className="size-4" />
              Reason
            </div>
          </TableHead>
          <TableHead>
            <div className="flex items-center gap-2">
              <Play className="size-4" />
              Action
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.uploader.name}</TableCell>
            <TableCell>
              {item.uploadedAt.toLocaleDateString('en-UK', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </TableCell>
            <TableCell>{item.location}</TableCell>
            <TableCell>{item.reason}</TableCell>
            <TableCell>
              <Link
                to="/file/$url"
                params={{ url: item.file.url }}
                search={{ name: item.file.name }}
                className="flex items-center gap-2"
              >
                View <ExternalLink className="size-4" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
