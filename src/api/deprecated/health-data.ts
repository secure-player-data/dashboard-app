import {
  Injury,
  MedicalReport,
  Vaccination,
} from '@/entities/data/health-data';
import {
  getDate,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
} from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { paths } from '../paths';
import { safeCall } from '@/utils';
import { log } from '@/lib/log';
import {
  INJURY_SCHEMA,
  MEDICAL_REPORT_CONTENT_SCHEMA,
  MEDICAL_REPORT_METADATA_SCHEMA,
  VACCINATION_METADATA_SCHEMA,
  VACCINATION_SCHEMA,
} from '@/schemas/health-data';

/**
 * Returns a list of injuries for a player
 * @param session of the user requesting the data
 * @param playerPod of the player to fetch the injuries for
 * @returns
 */
export async function fetchInjuries(
  session: Session | null,
  playerPod: string
): Promise<Injury[]> {
  if (!session) {
    throw new Error('Session not found');
  }

  const injuryUrl = paths.healthData.injuries.root(playerPod);
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

/**
 * Returns a list of medical reports for a player
 * @param session of the user requesting the data
 * @param playerPod pod of the player to fetch the reports for
 */
export async function fetchMedicalReports(
  session: Session | null,
  playerPod: string
): Promise<MedicalReport[]> {
  if (!session) {
    throw new Error('Session not found');
  }

  const reportsUrl = paths.healthData.medicalReports.root(playerPod);
  const dataset = await getSolidDataset(reportsUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== `${reportsUrl}/`
  );

  const reports = await Promise.all(
    things.map(async (thing) => {
      const [error, reportDataset] = await safeCall(
        getSolidDataset(thing.url, {
          fetch: session.fetch,
        })
      );
      if (error) {
        log({
          type: 'error',
          label: 'Fetch Medical Reports',
          message: `Failed to fetch report dataset: ${thing.url}`,
        });
        return;
      }
      const metadata = getThing(reportDataset, `${thing.url}#metadata`);
      const content = getThingAll(reportDataset).filter(
        (contentThing) => contentThing.url !== `${thing.url}#metadata`
      );
      return mapThingToMedicalReport(metadata, content);
    })
  );

  return reports.filter((report) => report !== undefined);
}

export async function fetchVaccinations(
  session: Session | null,
  playerPod: string
) {
  if (!session) {
    throw new Error('Session not found');
  }

  const vaccinationsUrl = paths.healthData.vaccinations.root(playerPod);
  const dataset = await getSolidDataset(vaccinationsUrl, {
    fetch: session.fetch,
  });
  const things = getThingAll(dataset).filter(
    (thing) => thing.url !== `${vaccinationsUrl}/`
  );

  const vaccinations = await Promise.all(
    things.map(async (thing) => {
      const [error, reportDataset] = await safeCall(
        getSolidDataset(thing.url, {
          fetch: session.fetch,
        })
      );
      if (error) {
        log({
          type: 'error',
          label: 'Fetch Medical Reports',
          message: `Failed to fetch report dataset: ${thing.url}`,
        });
        return;
      }
      const metadata = getThing(reportDataset, `${thing.url}#metadata`);
      const history = getThingAll(reportDataset).filter(
        (historyThing) => historyThing.url !== `${thing.url}#metadata`
      );
      return mapThingToVaccination(metadata, history);
    })
  );

  return vaccinations.filter((vaccination) => vaccination !== undefined);
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

function mapThingToMedicalReport(metadata: any, content: any): MedicalReport {
  return {
    title:
      getStringNoLocale(metadata, MEDICAL_REPORT_METADATA_SCHEMA.title) ?? '',
    date: getDate(metadata, MEDICAL_REPORT_METADATA_SCHEMA.date) ?? new Date(),
    doctor:
      getStringNoLocale(metadata, MEDICAL_REPORT_METADATA_SCHEMA.doctor) ?? '',
    category:
      getStringNoLocale(metadata, MEDICAL_REPORT_METADATA_SCHEMA.category) ??
      '',
    content: content.map((thing: any) => ({
      title:
        getStringNoLocale(thing, MEDICAL_REPORT_CONTENT_SCHEMA.title) ?? '',
      text:
        getStringNoLocale(thing, MEDICAL_REPORT_CONTENT_SCHEMA.content) ?? '',
    })),
  };
}

function mapThingToVaccination(metadata: any, history: any): Vaccination {
  return {
    name: getStringNoLocale(metadata, VACCINATION_METADATA_SCHEMA.name) ?? '',
    description:
      getStringNoLocale(metadata, VACCINATION_METADATA_SCHEMA.description) ??
      '',
    history: history.map((thing: any) => ({
      date: getDate(thing, VACCINATION_SCHEMA.date) ?? new Date(),
      expirationDate:
        getDate(thing, VACCINATION_SCHEMA.expirationDate) ?? new Date(),
      provider: getStringNoLocale(thing, VACCINATION_SCHEMA.provider) ?? '',
      batchNumber:
        getStringNoLocale(thing, VACCINATION_SCHEMA.batchNumber) ?? '',
      notes: getStringNoLocale(thing, VACCINATION_SCHEMA.notes) ?? '',
    })),
  };
}
