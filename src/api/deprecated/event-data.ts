import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import {
  getInteger,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
} from '@inrupt/solid-client';
import { EventAggregation, EventData } from '@/entities/data/event-data';
import { EVENT_AGGREGATION_SCHEMA, EVENT_DATA_SCHEMA } from '@/schemas/event';
import { safeCall } from '@/utils';
import { log } from '@/lib/log';

/**
 * Fetch aggregated event data for a player
 * @param session of the user reqiesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @param season (optional) if provided, fetch aggregated data for the given season,
 * if not fetch aggregated data for player's entire career
 * @returns aggregated event data for a player (goals, assists, ...)
 */
export async function fetchAggregatedEventData({
  session,
  pod,
  type,
  season,
}: {
  session: Session | null;
  pod: string | null;
  type: 'club' | 'nation';
  season?: string;
}): Promise<EventAggregation> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const category =
    type === 'club' ? paths.eventData.club : paths.eventData.national;
  const path = season
    ? category.season.aggregation(pod, season)
    : category.aggregation(pod);

  const [error, dataset] = await safeCall(
    getSolidDataset(path, {
      fetch: session.fetch,
    })
  );

  if (error) {
    return {
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      corners: 0,
      freeKicks: 0,
      penalties: 0,
      throwIns: 0,
      throphies: 0,
    };
  }

  const thing = getThing(dataset, `${path}#aggregation`);
  if (!thing) {
    throw new Error('Failed to find aggregation data');
  }

  return {
    goals: getInteger(thing, EVENT_AGGREGATION_SCHEMA.goals) ?? 0,
    assists: getInteger(thing, EVENT_AGGREGATION_SCHEMA.assists) ?? 0,
    yellowCards: getInteger(thing, EVENT_AGGREGATION_SCHEMA.yellowCards) ?? 0,
    redCards: getInteger(thing, EVENT_AGGREGATION_SCHEMA.redCards) ?? 0,
    corners: getInteger(thing, EVENT_AGGREGATION_SCHEMA.corners) ?? 0,
    freeKicks: getInteger(thing, EVENT_AGGREGATION_SCHEMA.freeKicks) ?? 0,
    penalties: getInteger(thing, EVENT_AGGREGATION_SCHEMA.penalties) ?? 0,
    throwIns: getInteger(thing, EVENT_AGGREGATION_SCHEMA.throwIns) ?? 0,
    throphies: getInteger(thing, EVENT_AGGREGATION_SCHEMA.throphies) ?? 0,
  };
}

/**
 * Returns an array with all events for a match
 * @param session of the user requesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @param season season the match was played in
 * @param matchId id of the match to fetch events for
 */
export async function fetchEventsForMatch({
  session,
  pod,
  type,
  season,
  matchId,
}: {
  session: Session | null;
  pod: string | null;
  type: 'club' | 'nation';
  season: string;
  matchId: string;
}): Promise<EventData[]> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const category =
    type === 'club' ? paths.eventData.club : paths.eventData.national;
  const [error, dataset] = await safeCall(
    getSolidDataset(category.season.match(pod, season, matchId), {
      fetch: session.fetch,
    })
  );

  if (error) {
    log({
      type: 'error',
      label: 'Event Data',
      message: 'Failed to fetch events for match',
      obj: error,
    });
    throw new Error('Failed to fetch events for match');
  }

  const things = getThingAll(dataset).filter(
    (thing) => !thing.url.includes('#metadata')
  );

  return things
    .map(mapThingToEvent)
    .sort((a, b) => a.time.localeCompare(b.time));
}

function mapThingToEvent(thing: any): EventData {
  return {
    event: getStringNoLocale(thing, EVENT_DATA_SCHEMA.event) ?? '',
    time: getStringNoLocale(thing, EVENT_DATA_SCHEMA.time) ?? '',
    notes: getStringNoLocale(thing, EVENT_DATA_SCHEMA.notes) ?? '',
  };
}
