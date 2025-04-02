import { Session } from '@inrupt/solid-client-authn-browser';
import data from './seed.json';
import { BASE_APP_CONTAINER } from '@/api/paths';
import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  createThing,
  saveFileInContainer,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { safeCall } from '@/utils';
import { DATA_INFO_SCHEMA } from '@/schemas/data-info';

export async function seedDb(session: Session, pod: string) {
  await Promise.all(
    data.map(async (type) => {
      type.data.map(async (entry) => {
        const id = crypto.randomUUID();

        const path = `${pod}${BASE_APP_CONTAINER}/${type.category}/files/`;
        await safeCall(createContainerAt(path, { fetch: session.fetch }));

        const file = genereteMockCsv(entry.file);
        const fileName = file.name;
        const renamedFile = new File([file], `${id}.csv`, { type: file.type });

        await saveFileInContainer(path, renamedFile, {
          fetch: session.fetch,
        });

        const thing = buildThing(createThing({ name: id }))
          .addUrl(RDF.type, DATA_INFO_SCHEMA.type)
          .addStringNoLocale(DATA_INFO_SCHEMA.fileUrl, `${path}${id}.csv`)
          .addStringNoLocale(DATA_INFO_SCHEMA.fileName, fileName)
          .addStringNoLocale(DATA_INFO_SCHEMA.webId, entry.uploadedBy.webId)
          .addStringNoLocale(DATA_INFO_SCHEMA.name, entry.uploadedBy.name)
          .addDate(DATA_INFO_SCHEMA.uploadedAt, new Date(entry.uploadedAt))
          .addStringNoLocale(DATA_INFO_SCHEMA.reason, entry.reason)
          .addStringNoLocale(DATA_INFO_SCHEMA.location, entry.location)
          .addStringNoLocale(DATA_INFO_SCHEMA.status, '')
          .build();

        let dataset = createSolidDataset();
        dataset = setThing(dataset, thing);

        const url = `${pod}${BASE_APP_CONTAINER}/${type.category}/${id}`;
        const [error] = await safeCall(
          saveSolidDatasetAt(url, dataset, { fetch: session.fetch })
        );

        if (error) {
          console.error(error);
        }
      });
    })
  );
}

function genereteMockCsv(file: {
  name: string;
  content: Record<string, unknown>[];
}): File {
  const headers = Object.keys(file.content[0]).join(',');
  const rows = file.content
    .map((row) => Object.values(row).join(','))
    .join('\n');

  const csvContent = `${headers}\n${rows}`;

  const blob = new Blob([csvContent], { type: 'text/csv' });

  return new File([blob], file.name, { type: 'text/csv' });
}
