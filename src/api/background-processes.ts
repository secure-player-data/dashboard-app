import { Session } from '@inrupt/solid-client-authn-browser';
import { ACCESS_HISTORY_CONTAINER, BASE_APP_CONTAINER } from './paths';
import {
  Thing,
  deleteSolidDataset,
  getSolidDataset,
  getThingAll,
  saveSolidDatasetInContainer,
  getDatetime,
  createContainerAt,
} from '@inrupt/solid-client';
import { LOG_SCHEMA } from '@/lib/schemas';

/**
 * Sorts the raw appended items in a public append container into sorted containers
 * @param session of the user
 * @param container that is to be paginated
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

  const parentDataset = await getSolidDataset(containerUrl, {
    fetch: session.fetch,
  });

  const things = getThingAll(parentDataset);

  await prepareForSorting(session, things, containerUrl);

  let sortedList = await sortAccessHistoryByDate(session, things);
  let latestPage = getLatestPage(things, containerUrl);

  let sliceAmount = 0;
  let finishedSorting = false;
  while (!finishedSorting) {
    sortedList = sortedList.slice(sliceAmount);

    const entriesInLatestPage = await checkEntriesInPage(
      session,
      latestPage.path
    );

    if (entriesInLatestPage < 25) {
      for (let i = 0; i <= 25 - entriesInLatestPage; i++) {
        console.log('moving resources');
        console.log('sorted list iteration: ', sortedList);
        sliceAmount = 25 - entriesInLatestPage + 1;
        if (sortedList[i]) {
          await moveResource(session, sortedList[i].url, latestPage.path);
        } else {
          finishedSorting = true;
        }
      }
    } else {
      if (sortedList.length <= 0) {
        break;
      }
      await createContainerAt(
        `${containerUrl}/page-${latestPage.pageNumber + 1}`,
        { fetch: session.fetch }
      );
      const parentDataset = await getSolidDataset(containerUrl, {
        fetch: session.fetch,
      });

      const things = getThingAll(parentDataset);

      latestPage = getLatestPage(things, containerUrl);
    }
    //reset slice amount
    sliceAmount = 0;
  }
}

/**
 * finds the page with the highest number (latest one to be created)
 * @param things things in the parent container
 * @param containerUrl the url of the parent container
 */
function getLatestPage(things: Thing[], containerUrl: string) {
  const pages = things
    .map((container) => {
      if (container.url.includes('page')) {
        const pageNumber = container.url.split('page-')[1].replace('/', '');
        return { pageNumber: parseInt(pageNumber), path: container.url };
      }
      return null;
    })
    .filter((num) => num !== null);

  const latestPage = pages.length
    ? pages.reduce((max, current) =>
        current.pageNumber > max.pageNumber ? current : max
      )
    : { pageNumber: 1, path: `${containerUrl}/page-1` };
  return latestPage;
}

/**
 * Sorts all the unsorted things by their date found in the resource
 * @param session of the user
 * @param things that are to be sorted
 */
async function sortAccessHistoryByDate(session: Session, things: Thing[]) {
  let list: { url: string; date: Date }[] = [];
  for (const item of things) {
    const resource = await getSolidDataset(item.url, {
      fetch: session.fetch,
    });
    const thing = getThingAll(resource)[0];

    const time = getDatetime(thing, LOG_SCHEMA.time) ?? '';
    const url = item.url;
    const date = new Date(time);
    if (!url.endsWith('/') && time !== '') {
      list.push({ url, date });
    }
  } // Sort list after all asynchronous operations are done
  list.sort((a, b) => a.date.getTime() - b.date.getTime());
  return list;
}

/**
 * checks the amount of entries within a page
 * @param session of the user
 * @param path the path to the page of which to check the number of entries
 */
async function checkEntriesInPage(session: Session, path: string) {
  const dataset = await getSolidDataset(path, { fetch: session.fetch });
  const entryAmount = getThingAll(dataset).length;
  return entryAmount;
}

/**
 * Creates a first page if one does not already exist
 * @param session of the user
 * @param things in the container you want to sort
 * @param containerUrl location of where you want the first page to be set
 */
async function prepareForSorting(
  session: Session,
  things: Thing[],
  containerUrl: string
) {
  const hasPage1 = things.some((thing) => thing.url.includes('page-1'));
  if (!hasPage1) {
    await createContainerAt(`${containerUrl}/page-1`, {
      fetch: session.fetch,
    });
  }
}

/**
 * Moves a resource from one container to another
 * @param session of the user
 * @param oldPath the original path to move the resource from
 * @param newPath the new path where the resource should be moved to
 */
async function moveResource(
  session: Session,
  oldPath: string,
  newPath: string
) {
  const datasetToMove = await getSolidDataset(oldPath, {
    fetch: session.fetch,
  });
  await saveSolidDatasetInContainer(newPath, datasetToMove, {
    fetch: session.fetch,
  });
  await deleteSolidDataset(oldPath, { fetch: session.fetch });
}
