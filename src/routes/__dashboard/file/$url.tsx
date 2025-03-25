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
import { useAuth } from '@/context/auth-context';
import { useGetFile } from '@/use-cases/data';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { ChevronLeft, FileDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';

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

  const { data, isPending, error } = useGetFile(session, url);

  function goBack() {
    router.history.back();
  }

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <section className="flex flex-col pb-4 h-full">
      <header className="flex items-center justify-between mb-4">
        <Button onClick={goBack} variant="outline">
          <ChevronLeft className="size-4" />
          Back
        </Button>
        <Button variant="outline" asChild>
          <a href={URL.createObjectURL(data.blob)} download={data.name}>
            <FileDown className="size-4" />
            Export
          </a>
        </Button>
      </header>
      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>{name.split('.').slice(0, -1)}</CardTitle>
          <CardDescription>Content of the file '{name}'</CardDescription>
        </CardHeader>
        <CardContent>
          <FileRendrer blob={data.blob} name={name} mimeType={data.mimeType} />
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

  if (mimeType.startsWith('image/')) {
    return <img src={fileUrl} alt={name} style={{ maxWidth: '100%' }} />;
  }

  if (mimeType.startsWith('video/')) {
    return <video controls src={fileUrl} style={{ maxWidth: '100%' }} />;
  }

  if (mimeType.startsWith('audio/')) {
    return <audio controls src={fileUrl} />;
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

  if (mimeType === 'text/csv') {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
      blob.text().then(setText);
    }, [blob]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {text
              ?.split('\n')[0]
              .split(',')
              .map((cell) => <TableHead key={cell}>{cell}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {text
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
    );
  }

  if (mimeType.startsWith('text/')) {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
      blob.text().then(setText);
    }, [blob]);

    return <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>;
  }
}
