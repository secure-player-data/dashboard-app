import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import { getInteger, getSolidDataset, getThing } from '@inrupt/solid-client';
import { EventAggregation } from '@/entities/data/event-data';
import { EVENT_AGGREGATION_SCHEMA } from '@/schemas/event';

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

  const dataset = await getSolidDataset(path, {
    fetch: session.fetch,
  });

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
