import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import {
  getInteger,
  getSolidDataset,
  getStringNoLocale,
  getThing,
} from '@inrupt/solid-client';
import { FootballAggregation, SeasonInfo } from '@/entities/data/football-data';
import {
  FOOTBALL_AGGREGATION_SCHEMA,
  SEASON_INFO_SCHEMA,
} from '@/schemas/football';

/**
 * Fetch aggregated football data for a player
 * @param session of the user reqiesting the data
 * @param pod pod url of the player to fetch the data for
 * @param type wether to fetch data for players club or nation performance
 * @param season (optional) if provided, fetch aggregated data for the given season,
 * if not fetch aggregated data for player's entire career
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

  const dataset = await getSolidDataset(path, {
    fetch: session.fetch,
  });

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
