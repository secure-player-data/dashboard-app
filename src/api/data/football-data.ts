import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import {
  getInteger,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
} from '@inrupt/solid-client';
import { FootballAggregation, SeasonInfo } from '@/entities/data/football-data';
import {
  FOOTBALL_AGGREGATION_SCHEMA,
  SEASON_INFO_SCHEMA,
} from '@/schemas/football';
import { EventAggregation } from '@/entities/data/event-data';
import { fetchAggregatedEventData } from './event-data';
import { safeCall } from '@/utils';

/**
 * Fetch aggregated football data for a player
 * @param session of the user reqiesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @param season (optional) if provided, fetch aggregated data for the given season,
 * if not fetch aggregated data for player's entire career
 * @returns aggregated data for the player (matches played, minutes played)
 */
export async function fetchAggregatedFootballData({
  session,
  pod,
  type,
  season,
}: {
  session: Session | null;
  pod: string | null;
  type: 'club' | 'nation';
  season?: string;
}): Promise<FootballAggregation> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const category =
    type === 'club' ? paths.footballData.club : paths.footballData.national;
  const path = season
    ? category.season.aggregation(pod, season)
    : category.aggregation(pod);

  const [error, dataset] = await safeCall(
    getSolidDataset(path, {
      fetch: session.fetch,
    })
  );

  if (error) {
    return { matches: 0, minutesPlayed: 0 };
  }

  const thing = getThing(dataset, `${path}#aggregation`);
  if (!thing) {
    throw new Error('Failed to find aggregation data');
  }

  const data = {
    matches: getInteger(thing, FOOTBALL_AGGREGATION_SCHEMA.matches) ?? 0,
    minutesPlayed:
      getInteger(thing, FOOTBALL_AGGREGATION_SCHEMA.minutesPlayed) ?? 0,
  };

  return data;
}

/**
 * Fetches info for a season of a player
 * @param session of the user reqiesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @param season season to fetch metadata for
 * @returns info about the season (team, league)
 */
export async function fetchSeasonInfo({
  session,
  pod,
  type,
  season,
}: {
  session: Session | null;
  pod: string | null;
  type: 'club' | 'nation';
  season: string;
}): Promise<SeasonInfo> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const category =
    type === 'club' ? paths.footballData.club : paths.footballData.national;
  const path = category.season.info(pod, season);

  const dataset = await getSolidDataset(path, {
    fetch: session.fetch,
  });

  const thing = getThing(dataset, `${path}#season-info`);
  if (!thing) {
    throw new Error('Failed to find metadata for season');
  }

  return {
    season: season,
    team: getStringNoLocale(thing, SEASON_INFO_SCHEMA.team) ?? '',
    league: getStringNoLocale(thing, SEASON_INFO_SCHEMA.league) ?? '',
  };
}

/**
 * Fetches info for all seasons of a player
 * @param session of the user reqiesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @returns an object with season info and aggregated season and event data
 */
export async function fetchAllSeasonInfo({
  session,
  pod,
  type,
}: {
  session: Session | null;
  pod: string | null;
  type: 'club' | 'nation';
}): Promise<
  { info: SeasonInfo & FootballAggregation; events: EventAggregation }[]
> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const category =
    type === 'club' ? paths.footballData.club : paths.footballData.national;
  const path = category.root(pod);

  const dataset = await getSolidDataset(path, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) =>
      thing.url !== `${path}/` && thing.url !== category.aggregation(pod)
  );

  const seasonsInfo = await Promise.all(
    things.map(async (thing) => {
      const season = thing.url.replace(/\/$/, '').split('/').pop();
      const [info, aggregation, events] = await Promise.all([
        await fetchSeasonInfo({
          session,
          pod,
          type,
          season: season!,
        }),
        await fetchAggregatedFootballData({
          session,
          pod,
          type,
          season,
        }),
        await fetchAggregatedEventData({
          session,
          pod,
          type,
          season: season!,
        }),
      ]);
      return { info: { ...info, ...aggregation }, events };
    })
  );

  return seasonsInfo;
}
