import {
  getDate,
  getInteger,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
} from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import { TrackingData } from '@/entities/data/tracking-data';
import { TRACKING_DATA_SCHEMA } from '@/schemas/tracking-data';
import { METADATA_SCHEMA } from '@/schemas/metadata';
import { safeCall } from '@/utils';
import { FOOTBALL_DATA_SCHEMA } from '@/schemas/football';

/**
 * Returns a list of links to all seasons with tracking data
 * @param session of the user requesting the list
 * @param pod of the user to fetch the data from
 * @param sessionType match or training
 */
export async function fetchAllSeasonsWithTracking(
  session: Session | null,
  pod: string | null,
  sessionType: string
): Promise<string[]> {
  if (!session || !pod) {
    throw new Error('Session and pod are required');
  }

  let category;
  if (sessionType === 'matches') {
    category = paths.trackingData.matches.root;
  } else if (sessionType === 'training') {
    category = paths.trackingData.training.root;
  } else {
    return [];
  }
  const dataset = await getSolidDataset(category(pod), {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== `${category(pod)}/`
  );

  return things.map((thing) => thing.url);
}

/**
 * Returns a list of all matches for a season with tracking data
 * @param session of the user requesting the list
 * @param season full url of the season folder
 * @returns list of match urls and their date
 */
export async function fetchAllMatchesForSeasonWithTracking(
  session: Session | null,
  season: string
): Promise<{ url: string; date: Date }[]> {
  if (!session) {
    throw new Error('Session and pod are required');
  }

  const dataset = await getSolidDataset(season, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter((thing) => thing.url !== season);

  const matches = await Promise.all(
    things.map(async (thing) => {
      const trackingDataset = await getSolidDataset(thing.url, {
        fetch: session.fetch,
      });
      const metadata = getThing(trackingDataset, `${thing.url}#metadata`);
      if (!metadata) {
        return { url: thing.url, date: new Date() };
      }
      const matchUrl = getStringNoLocale(metadata, METADATA_SCHEMA.match) ?? '';
      const [error, matchDataset] = await safeCall(
        getSolidDataset(matchUrl, {
          fetch: session.fetch,
        })
      );
      if (error) {
        return { url: thing.url, date: new Date() };
      }
      const matchDetails = getThingAll(matchDataset)[0];
      const matchDate = getDate(matchDetails, FOOTBALL_DATA_SCHEMA.date);
      return { url: thing.url, date: matchDate ?? new Date() };
    })
  );

  return matches;
}

/**
 * Returns tracking data for the given session
 * @param session of the user requesting the data
 * @param sessionUrl full url to the session resource (match or training)
 */
export async function fetchTrackingData(
  session: Session | null,
  sessionUrl: string
): Promise<TrackingData[]> {
  if (!session) {
    throw new Error('Session is required');
  }

  const dataset = await getSolidDataset(sessionUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== sessionUrl && !thing.url.endsWith('#metadata')
  );

  return things.map(mapThingToTrackingData);
}

function mapThingToTrackingData(thing: any): TrackingData {
  const coordinates = getStringNoLocale(
    thing,
    TRACKING_DATA_SCHEMA.coordinates
  )?.split(',');
  return {
    coordinates: {
      x: coordinates ? Number(coordinates[0]) : 0,
      y: coordinates ? Number(coordinates[1]) : 0,
      z: coordinates ? Number(coordinates[2]) : 0,
    },
    distance: getInteger(thing, TRACKING_DATA_SCHEMA.distance) ?? 0,
    speed: getInteger(thing, TRACKING_DATA_SCHEMA.speed) ?? 0,
    time: getStringNoLocale(thing, TRACKING_DATA_SCHEMA.time) ?? '',
  };
}
