import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { Session } from '@inrupt/solid-client-authn-browser';
import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  createThing,
  getSolidDataset,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client';
import { DATA_INFO_SCHEMA } from '@/schemas/data-info';
import { RDF } from '@inrupt/vocab-common-rdf';
import { paths } from './paths';
import { safeCall } from '@/utils';
import { sendInformation } from './inbox';
import { saveFileInContainer } from '@inrupt/solid-client';
import { logResourceAccess } from './access-history';

export async function uploadPlayerData(
  session: Session | null,
  uploadedFiles: File[],
  senderPod: string,
  uploader: { webId: string; name: string },
  reason: string,
  location: string,
  category: string,
  receiverPod: string
) {
  // Check for null
  if (!session) {
    throw new SessionNotSetException('No session when uploading player data');
  }

  await Promise.all(
    uploadedFiles.map(async (uploadedFile) => {
      const id = crypto.randomUUID();
      const fileExtension = uploadedFile.name.split('.').pop(); // Get original file extension
      const newFileName = `${id}.${fileExtension}`; // Keep original extension

      const fileBuffer = await uploadedFile.arrayBuffer(); // Preserve file content
      const renamedFile = new File([fileBuffer], newFileName, {
        type: uploadedFile.type,
      });

      const fileContainerPath = `${paths.root(receiverPod)}${category}files/`;

      // Check if file container exists
      const [fileContainerError] = await safeCall(
        getSolidDataset(fileContainerPath, {
          fetch: session.fetch,
        })
      );

      // Create file container if it doesn't exist
      if (fileContainerError) {
        await safeCall(
          createContainerAt(fileContainerPath, { fetch: session.fetch })
        );
      }

      // Send renamed file to the container
      await saveFileInContainer(fileContainerPath, renamedFile, {
        fetch: session.fetch,
      });

      // Create the thing with the updated file reference
      const thing = buildThing(createThing({ name: id }))
        .addUrl(RDF.type, DATA_INFO_SCHEMA.type)
        .addStringNoLocale(
          DATA_INFO_SCHEMA.fileUrl,
          `${fileContainerPath}${newFileName}`
        )
        .addStringNoLocale(DATA_INFO_SCHEMA.fileName, uploadedFile.name)
        .addStringNoLocale(DATA_INFO_SCHEMA.webId, uploader.name)
        .addStringNoLocale(DATA_INFO_SCHEMA.name, uploader.name)
        .addDate(DATA_INFO_SCHEMA.uploadedAt, new Date())
        .addStringNoLocale(DATA_INFO_SCHEMA.reason, reason)
        .addStringNoLocale(DATA_INFO_SCHEMA.location, location)
        .build();

      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const url = `${paths.root(receiverPod)}${category}${id}`;
      await saveSolidDatasetAt(url, dataset, { fetch: session.fetch });

      await logResourceAccess({
        session,
        pod: receiverPod,
        resource: `${paths.root(receiverPod)}${category}${uploadedFile.name}`,
        action: 'Write',
      });
    })
  );

  const categoryStr = category.replace('-', ' ').replace('/', '');

  await sendInformation(
    session,
    senderPod,
    receiverPod,
    'Data was Uploaded to your pod',
    `You have new data in your pod. Visit '${categoryStr}' to view more information`
  );
}
