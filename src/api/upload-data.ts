import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { Session } from '@inrupt/solid-client-authn-browser';
import {
  buildThing,
  createSolidDataset,
  createThing,
  saveSolidDatasetAt,
  setThing,
} from '@inrupt/solid-client';
import { DATA_INFO_SCHEMA } from '@/schemas/data-info';
import { RDF } from '@inrupt/vocab-common-rdf';
import { paths } from './paths';
import { safeCall } from '@/utils';
import { sendInformation } from './inbox';
import { saveFileInContainer } from '@inrupt/solid-client';

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
      const thingName = crypto.randomUUID();
      const fileId = crypto.randomUUID();
      const fileExtension = uploadedFile.name.split('.').pop(); // Get original file extension
      const newFileName = `${fileId}.${fileExtension}`; // Keep original extension

      const fileBuffer = await uploadedFile.arrayBuffer(); // Preserve file content
      const renamedFile = new File([fileBuffer], newFileName, {
        type: uploadedFile.type,
      });

      const path = `${paths.root(receiverPod)}${category}files/`;

      // Send renamed file to the container
      await saveFileInContainer(path, renamedFile, {
        fetch: session.fetch,
      });

      // Construct the file URL dynamically without hardcoded ".csv"

      // Create the thing with the updated file reference
      const thing = buildThing(createThing({ name: thingName }))
        .addUrl(RDF.type, DATA_INFO_SCHEMA.type)
        .addStringNoLocale(DATA_INFO_SCHEMA.fileUrl, `${path}${newFileName}`)
        .addStringNoLocale(DATA_INFO_SCHEMA.fileName, uploadedFile.name)
        .addStringNoLocale(DATA_INFO_SCHEMA.webId, uploader.name)
        .addStringNoLocale(DATA_INFO_SCHEMA.name, uploader.name)
        .addDate(DATA_INFO_SCHEMA.uploadedAt, new Date())
        .addStringNoLocale(DATA_INFO_SCHEMA.reason, reason)
        .addStringNoLocale(DATA_INFO_SCHEMA.location, location)
        .build();
      // create dataset
      let dataset = createSolidDataset();
      dataset = setThing(dataset, thing);

      const url = `${paths.root(receiverPod)}${category}${thingName}`;

      // Save dataset at receiver location
      const [error, _] = await safeCall(
        saveSolidDatasetAt(url, dataset, { fetch: session.fetch })
      );

      if (error) {
        console.error(error);
      }
    })
  );

  // Send information to player inbox
  console.log(senderPod, receiverPod);
  await sendInformation(
    session,
    senderPod,
    receiverPod,
    'Data was Uploaded to your pod',
    `You have new data in your pod. Visit ${category} to view more information`
  );
}
