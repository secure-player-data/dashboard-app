import { TiptapPreview } from '@/components/text-editor/tiptap';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { useGetData, useGetFile } from '@/use-cases/data';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import {
  Calendar,
  ChevronLeft,
  FileDown,
  Loader2,
  Locate,
  User,
  File as FileIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { handleError } from '@/utils';

const searchParams = z.object({
  name: z.string(),
});

export const Route = createFileRoute('/__dashboard/file/$url')({
  component: RouteComponent,
  validateSearch: zodValidator(searchParams),
});

function RouteComponent() {
  const { session } = useAuth();
  const { url } = Route.useParams();
  const { name } = Route.useSearch();
  const router = useRouter();

  const {
    data: meta,
    isPending: metaPending,
    error: metaError,
  } = useGetData(session, url);
  const {
    data: file,
    isPending: filePending,
    error: fileError,
  } = useGetFile(session, meta?.file.url, meta?.file.name);

  function goBack() {
    router.history.back();
  }

  if (metaError) {
    return (
      <div className="grid place-items-center h-full text-muted-foreground">
        {handleError(metaError)}
      </div>
    );
  }

  if (fileError) {
    return (
      <div className="grid place-items-center h-full text-muted-foreground">
        {handleError(fileError)}
      </div>
    );
  }

  if (metaPending || filePending) {
    return (
      <div className="grid place-items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <section className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={goBack} variant="outline">
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button variant="outline" asChild>
          <a href={URL.createObjectURL(file.blob)} download={meta.file.name}>
            <FileDown className="size-4" />
            Export
          </a>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>File Info</CardTitle>
          <CardDescription>Information about the file</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2">
            <div className="flex gap-2 items-center">
              <FileIcon />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>{meta.file.name}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Locate />
              <div>
                <p className="text-sm text-muted-foreground">Data Source</p>
                <p>{meta.location}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <User />
              <div>
                <p className="text-sm text-muted-foreground">Uploaded By</p>
                <p>{meta.uploader.name}</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar />
              <div>
                <p className="text-sm text-muted-foreground">Uploaded At</p>
                <p>
                  {meta.uploadedAt.toLocaleDateString('en-UK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Legal Basis</p>
              <Textarea value={meta.reason} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Content of the file '{name}'</CardDescription>
        </CardHeader>
        <CardContent>
          <FileRendrer blob={file.blob} name={name} mimeType={file.mimeType} />
        </CardContent>
      </Card>
    </section>
  );
}

function FileRendrer({
  blob,
  name,
  mimeType,
}: {
  blob: Blob;
  name: string;
  mimeType: string;
}) {
  const fileUrl = URL.createObjectURL(blob);
  const [content, setContent] = useState('');

  useEffect(() => {
    blob.text().then(setContent);
  }, [blob]);

  if (mimeType.startsWith('image/')) {
    return <img src={fileUrl} alt={name} style={{ maxWidth: '100%' }} />;
  }

  if (mimeType.startsWith('video/')) {
    return <video controls src={fileUrl} style={{ maxWidth: '100%' }} />;
  }

  if (mimeType.startsWith('audio/')) {
    return <audio controls src={fileUrl} />;
  }

  if (mimeType.includes('text/html')) {
    return <TiptapPreview blob={blob} />;
  }

  if (mimeType === 'application/pdf') {
    return (
      <iframe
        src={fileUrl}
        title={name}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    );
  }

  if (mimeType.includes('text/csv')) {
    return (
      <div className="border rounded-md h-full">
        <Table>
          <TableHeader>
            <TableRow>
              {content
                ?.split('\n')[0]
                .split(',')
                .map((cell) => <TableHead key={cell}>{cell}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {content
              ?.split('\n')
              .slice(1)
              .map((row) => (
                <TableRow key={row}>
                  {row.split(',').map((cell) => (
                    <TableCell key={cell}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (mimeType.startsWith('text/')) {
    return <pre style={{ whiteSpace: 'pre-wrap' }}>{content}</pre>;
  }
}
