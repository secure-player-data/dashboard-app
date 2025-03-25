import {
  getDate,
  getInteger,
  getSolidDataset,
  getStringNoLocale,
  getThing,
} from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import { PersonalData } from '@/entities/data/personal-data';
import { PERSONAL_DATA_SCHEMA } from '@/schemas/personal-data';

/**
 * Fetch the personal data of a user
 * @param session of the user requesting the data
 * @param pod of the user to fetch the data from
 */
export async function fetchPersonalData(
  session: Session | null,
  pod: string | null
): Promise<PersonalData> {
  if (!session || !pod) {
    throw new Error('User not authenticated');
  }

  const dataset = await getSolidDataset(paths.personalData(pod), {
    fetch: session.fetch,
  });

  const thing = getThing(dataset, `${paths.personalData(pod)}#personal-data`);
  if (!thing) {
    throw new Error('Personal data not found');
  }

  return {
    name: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.name) ?? '',
    birtdate: getDate(thing, PERSONAL_DATA_SCHEMA.birthdate) ?? new Date(),
    address: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.address) ?? '',
    phone: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.phone) ?? '',
    email: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.email) ?? '',
    nation: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.nation) ?? '',
    height: getInteger(thing, PERSONAL_DATA_SCHEMA.height) ?? 0,
    weight: getInteger(thing, PERSONAL_DATA_SCHEMA.weight) ?? 0,
    dominantFoot:
      getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.dominantFoot) ?? '',
    position: getStringNoLocale(thing, PERSONAL_DATA_SCHEMA.position) ?? '',
  };
}
