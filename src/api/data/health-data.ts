import { Injury } from '@/entities/data/health-data';
import {
  getDate,
  getSolidDataset,
  getStringNoLocale,
  getThingAll,
} from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import { safeCall } from '@/utils';
import { log } from '@/lib/log';
import { INJURY_SCHEMA } from '@/schemas/health-data';

export async function fetchInjuries(
  session: Session | null,
  player: string
): Promise<Injury[]> {
  if (!session) {
    throw new Error('Session not found');
  }

  const injuryUrl = paths.healthData.injuries.root(player);
  const dataset = await getSolidDataset(injuryUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== `${injuryUrl}/`
  );

  const injuries = await Promise.all(
    things.map(async (thing) => {
      const [error, injuryDataset] = await safeCall(
        getSolidDataset(thing.url, {
          fetch: session.fetch,
        })
      );
      if (error) {
        log({
          type: 'error',
          label: 'Fetch Injuried',
          message: `Failed to fetch injury dataset: ${thing.url}`,
        });
        return;
      }
      const injuryThing = getThingAll(injuryDataset)[0];
      return mapThingToInjury(injuryThing);
    })
  );

  return injuries.filter((injury) => injury !== undefined);
}

function mapThingToInjury(thing: any): Injury {
  return {
    type: getStringNoLocale(thing, INJURY_SCHEMA.injuryType) ?? '',
    description: getStringNoLocale(thing, INJURY_SCHEMA.description) ?? '',
    location: getStringNoLocale(thing, INJURY_SCHEMA.location) ?? '',
    date: getDate(thing, INJURY_SCHEMA.date) ?? new Date(),
    severity: getStringNoLocale(thing, INJURY_SCHEMA.severity) ?? '',
    recoveryTime: getStringNoLocale(thing, INJURY_SCHEMA.recoveryTime) ?? '',
    treatment: getStringNoLocale(thing, INJURY_SCHEMA.treatment) ?? '',
    rehabilitationPlan:
      getStringNoLocale(thing, INJURY_SCHEMA.rehabilitationPlan) ?? '',
  };
}
