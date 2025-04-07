import { Session } from '@inrupt/solid-client-authn-browser';
import { BASE_APP_CONTAINER, paths } from './paths';
import { getSolidDataset, getThingAll } from '@inrupt/solid-client';

/**
 * Sorts the raw appended items in a public append container into sorted containers
 */
export async function sortAppendContainer(
  session: Session,
  pod: string,
  container: string
) {
  if (!session || !pod) {
    throw new Error('Session or Pod is missing');
  }
  const containerUrl = `${pod}${BASE_APP_CONTAINER}/${container}`;

  // fetch all unsorted things
  const parentDataset = await getSolidDataset(containerUrl, {
    fetch: session.fetch,
  });

  const things = getThingAll(parentDataset);
  console.log('things: ', things);
  const pages = things
    .map((container) => {
      if (container.url.includes('page')) {
        const pageNumber = container.url.split('page-')[1].replace('/', '');
        return { pageNumber: parseInt(pageNumber), path: container.url };
      }
      return null;
    })
    .filter((num) => num !== null);

  const latestPage = pages.reduce((max, current) =>
    current.pageNumber > max.pageNumber ? current : max
  );

  const entriesInLatestPage = await checkEntriesInPage(
    session,
    pod,
    latestPage.path
  );
  // Check if latest container is full or not
  if (entriesInLatestPage < 25) {
    //sort in latest container if not full
  } else {
    // create new container if the latest one is full
  }
  // Write to metadata
}

async function writeMetadata(session: Session, pod: string, container: string) {
  console.log('Attempted to write metadata');
}

async function checkEntriesInPage(session: Session, pod: string, path: string) {
  const dataset = await getSolidDataset(path, { fetch: session.fetch });
  const entryAmount = getThingAll(dataset).length;
  return entryAmount;
}
