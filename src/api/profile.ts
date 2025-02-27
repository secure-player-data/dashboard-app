import { seedDb } from '@/db/seed';
import { Session } from '@inrupt/solid-client-authn-browser';
import type { Profile } from '@/entities/data/profile';
import {
  createThing,
  getSolidDataset,
  getStringNoLocale,
  setThing,
  getThing,
  buildThing,
  createSolidDataset,
  saveSolidDatasetAt,
  setStringNoLocale,
  createContainerAt,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { BASE_APP_CONTAINER, paths } from './paths';
import {
  CredentialsNotSetException,
  ProfileDoesNotExistException,
} from '@/exceptions/profile-data-exceptions';
import { safeCall } from '@/utils';
import { fetchTeam } from './team';
import { TeamNotFoundException } from '@/exceptions/team-exceptions';
import { Team } from '@/entities/data/team';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { logAccessRequest } from './access-history';
import { setPublicAccess, updateAgentAccess } from './access-control';
import { Permission } from '@/entities/permissions';
import { PROFILE_SCHEMA } from '@/schemas/profile';

function isEmptyOrSpaces(str: string | null) {
  return str === null || str.match(/^ *$/) !== null;
}

/**
 * Fetches the profile data of the requesting user w/ team details if user is in a team
 * @param session of the requesting user
 * @param pod url to the pod to fetch the profile data from
 * @throws {ProfileDoesNotExistException} if profile data is not found
 * @throws {TeamNotFoundException} if team data is not found
 * @returns {Profile} profile data of the user
 */
export async function fetchProfileData(
  session: Session | null,
  pod: string | null
): Promise<Profile | null> {
  if (!session || !pod) {
    throw new SessionNotSetException('No session available');
  }

  // Get profile data
  const profileUrl = paths.profile(pod);

  const [datasetError, dataset] = await safeCall(
    getSolidDataset(profileUrl, {
      fetch: session.fetch,
    })
  );

  if (datasetError) {
    throw new ProfileDoesNotExistException('profile dataset was not found');
  }

  const profile = getThing(dataset, `${profileUrl}#profile`);
  if (!profile) {
    throw new ProfileDoesNotExistException('profile thing was not found');
  }

  const profileName = getStringNoLocale(profile, PROFILE_SCHEMA.name);
  const profileEmail = getStringNoLocale(profile, PROFILE_SCHEMA.email);
  const profileWebId = getStringNoLocale(profile, PROFILE_SCHEMA.webId);
  const teamUrl = getStringNoLocale(profile, PROFILE_SCHEMA.teamUrl);

  if (teamUrl === null) {
    throw new TeamNotFoundException('team url not found');
  }

  let team: Team | undefined = undefined;
  const [_, teamRes] = await safeCall(fetchTeam(session, teamUrl));
  if (teamRes) {
    team = teamRes;
  }

  const profileData: Profile = {
    name: profileName!,
    webId: profileWebId!,
    email: profileEmail!,
    team: team ?? null,
  };

  if (isEmptyOrSpaces(profileName) || isEmptyOrSpaces(profileEmail)) {
    throw new CredentialsNotSetException('Profile name or email not set');
  }

  return profileData;
}

/**
 * Updates the profile data of a user
 * @param session of the user requesting the update
 * @param pod url to the pod of the user to be updated
 * @param profile object containing the new profile data
 */
export async function updateAppProfile(
  session: Session | null,
  pod: string | null,
  profile: {
    name?: string | null;
    email?: string | null;
    teamUrl?: string | null;
  }
) {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  // Get pods and profile url
  const profileUrl = paths.profile(pod);

  // get profile dataset
  const [datasetError, dataset] = await safeCall(
    getSolidDataset(profileUrl, {
      fetch: session.fetch,
    })
  );

  if (datasetError) {
    throw new Error('could not found profile dataset when updating');
  }

  let thing = getThing(dataset, `${profileUrl}#profile`);

  if (!thing) {
    throw new Error('could not get thing');
  }

  if (profile.teamUrl) {
    thing = setStringNoLocale(thing, PROFILE_SCHEMA.teamUrl, profile.teamUrl);
  }
  if (profile.name) {
    thing = setStringNoLocale(thing, PROFILE_SCHEMA.name, profile.name);
  }
  if (profile.email) {
    thing = setStringNoLocale(thing, PROFILE_SCHEMA.email, profile.email);
  }

  const updatedDataset = setThing(dataset, thing);

  await saveSolidDatasetAt(profileUrl, updatedDataset, {
    fetch: session.fetch,
  });

  // If profile is not the user's own profile, log the update
  await logAccessRequest({
    session: session,
    pod,
    resource: profileUrl,
    action: 'Write',
  });
}

export async function initAppProfile(
  session: Session | null,
  pod: string | null,
  profile: Omit<Profile, 'webId' | 'team'>
) {
  if (!session || !pod) {
    throw new Error('No session or pod found');
  }

  // Create folders
  const pathsToCreate = [
    paths.inbox(pod),
    paths.accessHistory(pod),
    paths.footballData.club.root(pod),
    paths.footballData.national.root(pod),
    paths.eventData.club.root(pod),
    paths.eventData.national.root(pod),
    paths.trackingData.matches.root(pod),
    paths.trackingData.training.root(pod),
    paths.biometricData.matches.root(pod),
    paths.biometricData.training.root(pod),
    paths.healthData.injuries.root(pod),
    paths.healthData.medicalReports.root(pod),
    paths.healthData.vaccinations.root(pod),
  ];

  for await (const path of pathsToCreate) {
    console.log('Creating path: ', path);
    const [err, _] = await safeCall(
      createContainerAt(path, { fetch: session.fetch })
    );

    if (err) continue;
  }

  // Create profile
  await createAppProfile(session, pod, profile);

  // Init access control
  await updateAgentAccess({
    session,
    containerUrl: paths.root(pod),
    agentWebId: session.info.webId!,
    modes: ['Read', 'Write', 'Append', 'Control'],
  });

  const resourcesToSetPublicAccess = [
    {
      url: paths.profile(pod),
      modes: ['Read'],
    },
    {
      url: paths.inbox(pod),
      modes: ['Append'],
    },
    {
      url: paths.accessHistory(pod),
      modes: ['Append'],
    },
  ];

  for await (const resource of resourcesToSetPublicAccess) {
    console.log(
      `Setting public ${resource.modes.join(', ')} access for: `,
      resource.url
    );
    await setPublicAccess({
      session,
      url: resource.url,
      modes: resource.modes as Permission[],
    });
  }

  await seedDb(session, pod);
}

export async function createAppProfile(
  session: Session | null,
  pod: string,
  profile: Omit<Profile, 'webId' | 'team'>
) {
  if (!session) {
    throw new Error('No session found');
  }
  const profileUrl = `${pod}/${BASE_APP_CONTAINER}/Profile`;
  let appProfileSolidDataset = createSolidDataset();

  const appProfile = buildThing(createThing({ name: 'profile' }))
    .addUrl(RDF.type, PROFILE_SCHEMA.type)
    .addStringNoLocale(PROFILE_SCHEMA.name, profile.name)
    .addStringNoLocale(PROFILE_SCHEMA.email, profile.email)
    .addStringNoLocale(PROFILE_SCHEMA.webId, session.info.webId ?? '')
    .addStringNoLocale(PROFILE_SCHEMA.teamUrl, '')
    .build();

  appProfileSolidDataset = setThing(appProfileSolidDataset, appProfile);

  await safeCall(
    saveSolidDatasetAt(profileUrl, appProfileSolidDataset, {
      fetch: session.fetch,
    })
  );

  await setPublicAccess({
    session,
    url: profileUrl,
    modes: ['Read'],
  });
}
