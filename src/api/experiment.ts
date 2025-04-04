import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { Session } from '@inrupt/solid-client-authn-browser';
import { logResourceAccess } from './access-history';
import { getSolidDataset, getThingAll } from '@inrupt/solid-client';

export async function fillWithDummyData(
  session: Session | null,
  pod: string | null,
  n: number = 10
) {
  if (!session || !pod) {
    throw new SessionNotSetException('Session or pod not set');
  }

  await Promise.all(
    Array.from({ length: n }).map(async (_, i) => {
      logResourceAccess({
        session,
        pod,
        resource: `https://example.com/resource/${i}`,
        action: 'Read',
      });
    })
  );

  console.log('Done filling with dummy data');
}

export async function startExperiment(
  session: Session | null,
  pod: string | null
) {
  if (!session || !pod) {
    console.error('Cancel experiement: session or pod not set');
    return;
  }

  console.log('Starting experiment');
  for (let i = 0; i < 10; i++) {
    console.log('[Experiment] Iteration:', i);
    const start = performance.now();
    const res = await experiment(session, pod);
    const end = performance.now();

    console.log(`[Experiment] Items: ${res.length}, Time (ms): ${end - start}`);

    await sleep(1000 * 60 * 2);
  }
  console.log('Done with experiment');
}

async function experiment(session: Session, pod: string) {
  // Fetch the parent resource
  const parentDataset = await getSolidDataset(
    `${pod}/secure-player-data/access-history/`,
    {
      fetch: session.fetch,
    }
  );
  // Extract the things containing the url to the child resources
  const parentThings = getThingAll(parentDataset);

  const resources = await Promise.all(
    parentThings.map(async (thing) => {
      const url = thing.url;

      // Fetch the child resource
      const childDataset = await getSolidDataset(url, {
        fetch: session.fetch,
      });

      // Extract the thing
      const childThing = getThingAll(childDataset)[0];

      return childThing;
    })
  );

  return resources;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
