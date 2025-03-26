import { DataTable } from '@/components/tables/data/data-table';
import { columns } from '@/components/tables/data/columns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { DataInfo } from '@/entities/data-info';
import { useGetData } from '@/use-cases/data';
import { useGetProfile } from '@/use-cases/profile';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Calendar,
  Eye,
  Grid,
  List,
  Loader2,
  Locate,
  Trash,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { UseQueryResult } from '@tanstack/react-query';
import LayoutProvider, { useLayout } from '@/context/layout-context';
import { convertKebabCaseToString } from '@/utils';

export const Route = createFileRoute('/__dashboard/player/$pod/$category')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <LayoutProvider>
      <InnerPage />
    </LayoutProvider>
  );
}

function InnerPage() {
  const { pod, category } = Route.useParams();
  const { session } = useAuth();
  const { layout } = useLayout();
  const { data: profile } = useGetProfile(session, pod);
  const query = useGetData(session, pod, category);

  if (layout === 'grid') {
    return (
      <GridLayout
        query={query}
        category={category}
        name={profile?.name ?? ''}
      />
    );
  }

  return (
    <ListLayout query={query} category={category} name={profile?.name ?? ''} />
  );
}

function GridLayout({
  query,
  category,
  name,
}: {
  query: UseQueryResult<DataInfo[], Error>;
  category: string;
  name: string;
}) {
  const { setLayout } = useLayout();

  if (query.isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (query.error) {
    return <p>Error: {query.error.message}</p>;
  }

  if (query.data?.length === 0) {
    return <p className="text-muted-foreground">No data available...</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-between">
        <div>
          <h1 className="font-bold text-2xl">
            {convertKebabCaseToString(category)}
          </h1>
          <p className="text-muted-foreground">
            Viewing {convertKebabCaseToString(category)} for {name}
          </p>
        </div>
        <div>
          <Button
            onClick={() => setLayout('list')}
            variant="outline"
            className="rounded-r-none"
          >
            <List />
          </Button>
          <Button
            onClick={() => setLayout('grid')}
            variant="outline"
            className="rounded-l-none"
          >
            <Grid />
          </Button>
        </div>
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr)' }}
      >
        {query.data.map((item) => (
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
            </div>
            <div>
              <Label htmlFor="reason" className="text-xs text-muted-foreground">
                Reason
              </Label>
              <Textarea id="reason" value={item.reason} readOnly />
            </div>
            <div className="grid gap-2">
              <Button asChild variant="outline">
                <Link
                  to="/file/$url"
                  params={{ url: item.file.url }}
                  search={{ name: item.file.name }}
                >
                  <Eye className="size-4" />
                  View
                </Link>
              </Button>
              <Button variant="destructive">
                <Trash className="size-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListLayout({
  query,
  category,
  name,
}: {
  query: UseQueryResult<DataInfo[], Error>;
  category: string;
  name: string;
}) {
  if (query.isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (query.error) {
    return <p>Error: {query.error.message}</p>;
  }

  if (query.data?.length === 0) {
    return <p className="text-muted-foreground">No data available...</p>;
  }

  return (
    <DataTable
      data={query.data}
      columns={columns}
      category={category}
      name={name}
    />
  );
}
