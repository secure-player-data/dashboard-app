import { logResourceAccess } from '@/api/access-history';
import { sortAppendContainer } from '@/api/web-workers/background-processes';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { createFileRoute } from '@tanstack/react-router';
import { paths } from '@/api/paths';
import { getSolidDataset, getThingAll } from '@inrupt/solid-client';
import { useState } from 'react';

export const Route = createFileRoute('/__dashboard/playground')({
  component: RouteComponent,
});

function RouteComponent() {
  const { session, pod } = useAuth();
  const [pages, setPages] = useState<{ pageNumber: string; entries: number }[]>(
    []
  );
  const handleClick = async () => {
    if (!session || !pod) {
      throw new Error('pod or session was not defined');
    }
    await sortAppendContainer(session, pod, 'access-history');
  };

  const handleFill = async (random: boolean) => {
    if (!session || !pod) {
      throw new Error('pod or session was not defined');
    }
    const datasetUrl = `${paths.root(pod)}event-data/`;
    let number = 50;
    if (random) {
      number = Math.floor(Math.random() * 50);
    }

    console.log('filling with ', number, ' entries');
    for (let i = 0; i < number; i++) {
      await logResourceAccess({
        session: session,
        pod: pod,
        resource: datasetUrl,
        action: 'Read',
      });
      console.log('filled: ', i + 1);
    }
  };

  const handlePostCheck = async () => {
    if (!session || !pod) {
      throw new Error('pod or session was not defined');
    }

    setPages([]);
    const url = `${paths.accessHistory(pod)}`;
    const dataset = await getSolidDataset(url, { fetch: session.fetch });
    const things = getThingAll(dataset);
    const pagesWithEntries: { pageNumber: string; entries: number }[] = [];
    things.map(async (thing) => {
      if (thing.url.endsWith('/') && thing.url.includes('page')) {
        const pageNumber = thing.url.split('page-')[1];
        const dataset = await getSolidDataset(thing.url, {
          fetch: session.fetch,
        });
        const things = getThingAll(dataset);
        setPages((prev) => [
          ...prev,
          {
            pageNumber: pageNumber,
            entries: things.length - 1,
          },
        ]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <Button onClick={handleClick}> sort </Button>
        <Button className="bg-red-500" onClick={() => handleFill(false)}>
          fill access history{' '}
        </Button>
        <Button className="bg-red-500" onClick={() => handleFill(true)}>
          fill access history with random number{' '}
        </Button>
        <Button className="bg-green-500" onClick={() => handlePostCheck()}>
          check results
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {[...pages]
          .sort((a, b) => Number(a.pageNumber) - Number(b.pageNumber))
          .map((page) => (
            <div
              key={page.pageNumber + crypto.randomUUID()}
              className="border-2 border-green-500"
            >
              <p>Page: {page.pageNumber}</p>
              <p>--Entries: {page.entries}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
