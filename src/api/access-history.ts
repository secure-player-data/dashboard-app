import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  createThing,
  getDatetime,
  getSolidDataset,
  getStringNoLocale,
  getThingAll,
  getUrl,
  setThing,
  solidDatasetAsTurtle,
  Thing,
} from '@inrupt/solid-client';
import { Session } from '@inrupt/solid-client-authn-browser';
import { BASE_APP_CONTAINER, paths } from './paths';
import { LOG_SCHEMA } from '@/lib/schemas';
import { RDF, LDP } from '@inrupt/vocab-common-rdf';
import { AccessHistory } from '@/entities/access-history';
import { setPublicAccess } from './access-control';
import { Permission } from '@/entities/permissions';
import { log } from '@/lib/log';
import { QueryEngine } from '@comunica/query-sparql';
import { safeCall } from '@/utils';

const getEndpoint = (pod: string) =>
  `${pod}${BASE_APP_CONTAINER}/access-history/`;

/**
 * Initializes the access history for a user
 * @param session of the user to initialize
 * @param pod url of the users pod
 */
export async function initializeAccessHistory(session: Session, pod: string) {
  await createContainerAt(getEndpoint(pod), {
    fetch: session.fetch,
  });
  await setPublicAccess({
    session,
    url: getEndpoint(pod),
    modes: ['Append'],
  });
}

/**
 * Logs the event of a user accessing a resource
 * @param session of the user accessing the resource
 * @param pod url of the pod being accessed
 * @param resource link to the resource being accessed
 * @param action the action being performed on the resource
 */
export async function logResourceAccess({
  session,
  pod,
  resource,
  action,
}: {
  session: Session;
  pod: string;
  resource: string;
  action: Permission;
}) {
  if (
    !import.meta.env.PROD &&
    import.meta.env.VITE_APP_ENABLE_ACCESS_LOGGING === 'false'
  ) {
    log({
      type: 'info',
      label: 'Access Logging',
      message: 'Disabled, skipping logging',
    });
    return;
  }

  let dataset = createSolidDataset();

  const accessDate = new Date();
  const id = crypto.randomUUID();
  const resourceUrl = new URL(resource);
  const logEntry = buildThing(createThing({ name: id }))
    .addUrl(RDF.type, LOG_SCHEMA.log)
    .addUrl(LOG_SCHEMA.webId, session.info.webId!)
    .addUrl(LOG_SCHEMA.resource, resourceUrl.href)
    .addDatetime(LOG_SCHEMA.time, accessDate)
    .addStringNoLocale(LOG_SCHEMA.action, action)
    .build();

  dataset = setThing(dataset, logEntry);
  const datasetString = await solidDatasetAsTurtle(dataset);

  await session.fetch(getEndpoint(pod), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/turtle',
    },
    body: datasetString,
  });
}

/**
 * Returns the access history of the requesting user
 * @param session of the requesting user
 * @param pod url of the pod to get the access history of
 * @param limit number of items to return
 * @param page number of the page to return
 * @returns array of access history entries and total number of entries
 */
export async function fetchAccessHistory(
  session: Session | null,
  pod: string | null,
  limit: number = 25,
  page: number = 1
): Promise<{
  items: AccessHistory[];
  total: number;
}> {
  if (!session || !pod) {
    throw new Error('Session or pod not set');
  }

  const engine = new QueryEngine();

  const path = paths.accessHistory(pod);
  const query = `
    SELECT ?s ?p ?o WHERE {
      ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/ldp#RDFSource> .
    } LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;
  const totalQuery = `
    SELECT (COUNT(?s) as ?total) WHERE {
      ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/ns/ldp#RDFSource> .
    }
  `;

  const stream = await engine.queryBindings(query, {
    sources: [path],
    fetch: session.fetch,
  });
  const totalStream = await engine.queryBindings(totalQuery, {
    sources: [path],
    fetch: session.fetch,
  });

  const bindings = await stream.toArray();
  const totalBindings = await totalStream.toArray();

  const items = await Promise.all(
    bindings.map(async (binding, i) => {
      const url = binding.get('s')?.value;

      if (!url) {
        return null;
      }

      const [error, dataset] = await safeCall(
        getSolidDataset(url, { fetch: session.fetch })
      );
      if (error) {
        log({
          type: 'error',
          label: 'Fetch Access History',
          message: error.message,
          obj: error,
        });
        return null;
      }
      const thing = getThingAll(dataset)[0];

      if (!thing) {
        log({
          type: 'error',
          label: 'Fetch Access History',
          message: 'No thing found in dataset',
          obj: dataset,
        });
      }

      return mapThingToAccessHistory(thing);
    })
  );
  const filteredItems = items.filter(
    (item) => item !== null
  ) as AccessHistory[];

  return {
    items: filteredItems,
    total: Number(totalBindings[0].get('total')?.value) ?? 0,
  };
}

function mapThingToAccessHistory(thing: Thing): AccessHistory {
  return {
    webId: getUrl(thing, LOG_SCHEMA.webId) ?? '',
    resource: getUrl(thing, LOG_SCHEMA.resource) ?? '',
    time: getDatetime(thing, LOG_SCHEMA.time) ?? new Date(),
    action:
      (getStringNoLocale(
        thing,
        LOG_SCHEMA.action
      ) as AccessHistory['action']) ?? '',
  };
}
