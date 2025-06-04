import { Session } from '@inrupt/solid-client-authn-browser';
import { BASE_APP_CONTAINER, paths } from './paths';
import { Team } from '@/entities/data/team';
import {
  buildThing,
  createContainerAt,
  createSolidDataset,
  createThing,
  deleteFile,
  deleteSolidDataset,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
  removeThing,
  saveFileInContainer,
  saveSolidDatasetAt,
  setStringNoLocale,
  setThing,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { safeCall } from '@/utils';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import {
  TeamNotFoundException,
  TeamOwnerException,
} from '@/exceptions/team-exceptions';
import { TeamCreationConflictException } from '@/exceptions/team-creation-conflict-exception';
import { fetchProfileData, updateAppProfile } from './profile';
import { setPublicAccess, updateAgentAccess } from './access-control';
import { PROFILE_SCHEMA } from '@/schemas/profile';
import { TEAM_MEMBER_SCHEMA, TEAM_SCHEMA } from '@/schemas/team';
import { fetchMember, fetchMembersWithPermissions } from './member';
import { deleteInboxItem, sendLeaveTeamNotification } from './inbox';
import { purgeContainer } from './utils';

/**
 * Returns team details from the team specified by the teamUrl
 * @param session session of the requesting user
 * @param teamUrl to the team file containing the team details
 * @throws {SessionNotSetException} if session is not set
 * @throws {TeamNotFoundException} if team is not found
 * @returns {Team} team details
 */
export async function fetchTeam(
  session: Session | null,
  teamUrl: string | undefined
): Promise<Team> {
  if (!session) {
    throw new SessionNotSetException('[Fetch team] No session');
  }
  if (!teamUrl) {
    throw new Error('[Fetch team] No team url');
  }

  const [datasetError, teamDataset] = await safeCall(
    getSolidDataset(teamUrl, {
      fetch: session.fetch,
    })
  );

  if (datasetError) {
    throw new TeamNotFoundException('[Fetch team] Team not found');
  }

  const teamThing = getThing(teamDataset, `${teamUrl}#team`);
  if (!teamThing) {
    throw new TeamNotFoundException('Team thing not found');
  }

  return mapThingToTeam(teamThing);
}

/**
 * Returns the team url for a user
 * @param session of the requesting user
 * @param pod of the user to get the team url of
 */
export async function fetchTeamUrl(
  session: Session | null,
  pod: string | null
): Promise<string> {
  if (!session || !pod) {
    throw new Error('Session or pod not found');
  }

  const profileUrl = `${pod}${BASE_APP_CONTAINER}/Profile`;

  const [datasetError, dataset] = await safeCall(
    getSolidDataset(profileUrl, {
      fetch: session.fetch,
    })
  );

  if (datasetError) {
    throw new TeamNotFoundException('Profile dataset not found');
  }

  const profileThing = getThing(dataset, `${profileUrl}#profile`);

  if (!profileThing) {
    throw new TeamNotFoundException('Profile thing not found');
  }

  const teamUrl = getStringNoLocale(profileThing, PROFILE_SCHEMA.teamUrl);

  if (!teamUrl) {
    throw new TeamNotFoundException('Team url not found');
  }

  return teamUrl;
}

/**
 * Returns the webId and the pod url of the team owner
 * @param session of the user requesting the team owner
 * @param pod of the user to get the team owner of
 * @returns { webId, pod } of the team owner
 */
export async function fetchTeamOwner(
  session: Session | null,
  pod: string | null
) {
  if (!session || !pod) {
    throw new Error('session was not found');
  }

  const teamUrl = await fetchTeamUrl(session, pod);
  const teamDataset = await getSolidDataset(teamUrl, { fetch: session.fetch });
  const teamThing = getThing(teamDataset, `${teamUrl}#owner`);

  if (!teamThing) {
    throw new TeamNotFoundException('User is not in a team');
  }

  return {
    webId: getStringNoLocale(teamThing, TEAM_MEMBER_SCHEMA.webId) ?? '',
    pod: getStringNoLocale(teamThing, TEAM_MEMBER_SCHEMA.pod) ?? '',
  };
}

/**
 * Creates a new team at the requesting user's pod
 * @param name of the team
 * @param tag of the team (RBK, LSK, etc...)
 * @param session of the requesting user
 * @throws {SessionNotSetException} if session is not set
 */
export async function createTeam({
  session,
  pod,
  name,
  tag,
}: {
  session: Session | null;
  pod: string | null;
  name: string;
  tag: string;
}) {
  if (!session || !session.info.webId || !pod) {
    throw new SessionNotSetException('No session or pod');
  }

  // Create and add team details to dataset
  let dataset = createSolidDataset();
  const teamDetails = buildThing(createThing({ name: 'team' }))
    .addStringNoLocale(TEAM_SCHEMA.img, '')
    .addStringNoLocale(TEAM_SCHEMA.name, name)
    .addStringNoLocale(TEAM_SCHEMA.tag, tag)
    .addUrl(RDF.type, TEAM_SCHEMA.type)
    .build();
  dataset = setThing(dataset, teamDetails);

  // Create team folder
  await safeCall(
    createContainerAt(paths.team.root(pod), { fetch: session.fetch })
  );

  // Create and add owner as member
  const owner = buildThing(createThing({ name: 'owner' }))
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.webId, session.info.webId)
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.pod, pod)
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.role, 'Owner')
    .addUrl(RDF.type, TEAM_MEMBER_SCHEMA.type)
    .build();
  dataset = setThing(dataset, owner);

  // Upload team file
  const teamFileUrl = `${pod}${BASE_APP_CONTAINER}/Team`;
  await saveSolidDatasetAt(teamFileUrl, dataset, {
    fetch: session.fetch,
  });

  // Create acl file for team file (owner can read/write/control)
  await updateAgentAccess({
    session,
    containerUrl: teamFileUrl,
    agentWebId: session.info.webId,
    modes: ['Read', 'Append', 'Write', 'Control'],
  });

  // Update profile with team url
  await updateAppProfile(session, pod, { teamUrl: teamFileUrl });
}

/**
 * Updates the team detals
 * @param session of the user requesting the update
 * @param pod of the team owner
 * @param team new team details to update to
 */
export async function updateTeam({
  session,
  pod,
  team,
}: {
  session: Session | null;
  pod: string | null;
  team: {
    img?: File;
    name?: string;
    tag?: string;
    founded?: string;
    location?: string;
  };
}) {
  if (!session || !pod) {
    throw new Error('session was not found');
  }

  const [teamUrlError, teamUrl] = await safeCall(fetchTeamUrl(session, pod));

  if (teamUrlError) {
    throw new Error('Team url not found');
  }

  const [datasetError, dataset] = await safeCall(
    getSolidDataset(teamUrl, { fetch: session.fetch })
  );

  if (datasetError) {
    throw new Error('Team dataset not found');
  }

  let teamThing = getThing(dataset, `${teamUrl}#team`);

  if (!teamThing) {
    throw new Error('Team thing not found');
  }

  if (team.img) {
    const oldImg = getStringNoLocale(teamThing, TEAM_SCHEMA.img);
    const newImg = await updateTeamImage(session, pod, oldImg, team.img);
    teamThing = setStringNoLocale(teamThing, TEAM_SCHEMA.img, newImg);
  }

  if (team.name) {
    teamThing = setStringNoLocale(teamThing, TEAM_SCHEMA.name, team.name);
  }
  if (team.tag) {
    teamThing = setStringNoLocale(teamThing, TEAM_SCHEMA.tag, team.tag);
  }
  if (team.founded) {
    teamThing = setStringNoLocale(teamThing, TEAM_SCHEMA.founded, team.founded);
  }
  if (team.location) {
    teamThing = setStringNoLocale(
      teamThing,
      TEAM_SCHEMA.location,
      team.location
    );
  }

  const updatedDataset = setThing(dataset, teamThing);

  await saveSolidDatasetAt(teamUrl, updatedDataset, { fetch: session.fetch });
}

/**
 * Updates the image for a team
 * @param session of the user requesting the update
 * @param pod of the team
 * @param oldImgUrl url to the old image
 * @param newImg file with the new image
 * @return the url to the uploaded image
 */
async function updateTeamImage(
  session: Session,
  pod: string,
  oldImgUrl: string | null,
  newImg: File
): Promise<string> {
  // Delete old image
  if (oldImgUrl) {
    await deleteFile(oldImgUrl, { fetch: session.fetch });
  }

  // Upload new image
  const rootPath = paths.team.root(pod);
  const fullPath = `${rootPath}/${newImg.name}`;
  const [error, _] = await safeCall(
    saveFileInContainer(rootPath, newImg, { fetch: session.fetch })
  );
  await setPublicAccess({
    session,
    url: fullPath,
    modes: ['Read'],
  });

  if (error) {
    throw new Error('Failed to save file');
  }

  return fullPath;
}

/**
 * Add a member to a team
 * @param session of the user requesting the add
 * @param pod url of the team owners pod
 * @param memberWebId id of the member to add
 * @param memberPod pod url of the member to add
 * @param role the new member will have in the team
 */
export async function addMemberToTeam(
  session: Session | null,
  pod: string | null,
  memberWebId: string,
  memberPod: string,
  role: string
) {
  if (!session || !pod) {
    throw new Error('session was not found');
  }

  const teamUrl = await fetchTeamUrl(session, pod);
  let teamDataset = await getSolidDataset(teamUrl, { fetch: session.fetch });
  const id = crypto.randomUUID();

  const member = buildThing(createThing({ name: id }))
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.webId, memberWebId)
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.pod, memberPod)
    .addStringNoLocale(TEAM_MEMBER_SCHEMA.role, role)
    .addUrl(RDF.type, TEAM_MEMBER_SCHEMA.type)
    .build();

  const updatedTeamDataset = setThing(teamDataset, member);

  await saveSolidDatasetAt(teamUrl, updatedTeamDataset, {
    fetch: session.fetch,
  });
}

/**
 * Removes a member from the team
 * @param session of the user removing the member
 * @param pod of the user removing the member
 * @param memberWebId id of the member to remove
 * @param date of the leave team notification
 */
export async function removeMemberFromTeam(
  session: Session | null,
  pod: string | null,
  memberWebId: string,
  date: string
) {
  if (!session || !pod) {
    throw new SessionNotSetException('session was not found');
  }

  const teamUrl = await fetchTeamUrl(session, pod);
  let teamDataset = await getSolidDataset(teamUrl, { fetch: session.fetch });

  const things = getThingAll(teamDataset);

  const thingToRemove = things.find((thing) => {
    const webId = getStringNoLocale(thing, TEAM_MEMBER_SCHEMA.webId);
    return webId === memberWebId;
  });

  if (!thingToRemove) {
    throw new Error('Member not found');
  }

  teamDataset = removeThing(teamDataset, thingToRemove.url);
  await saveSolidDatasetAt(teamUrl, teamDataset, { fetch: session.fetch });

  await deleteInboxItem(session, pod, date);
}

/**
 * Leaves the team the user is in
 * @param session of the user leaving the team
 * @param pod of the user leaving the team
 */
export async function leaveTeam(session: Session | null, pod: string | null) {
  if (!session || !pod) {
    throw new Error('Session was not found');
  }

  const user = await fetchMember(session, pod);
  if (user.role === 'Owner') {
    throw new TeamOwnerException(
      'As a owner, you cannot leave the team. You need to transphere ownership of delete the team instead!'
    );
  }

  const teamOwner = await fetchTeamOwner(session, pod);

  await updateAgentAccess({
    session,
    containerUrl: paths.profile(pod),
    agentWebId: teamOwner.webId,
    modes: [],
  });

  await updateAppProfile(session, pod, { teamUrl: '' });
  await sendLeaveTeamNotification({
    sender: {
      session,
      pod,
      name: user.name,
      webId: user.webId,
    },
    receiver: {
      pod: teamOwner.pod,
    },
  });
}

/**
 * Delete the team
 * @param session user requesting the deletion
 * @param pod of the owner of the team
 */
export async function deleteTeam(session: Session | null, pod: string | null) {
  if (!session || !pod) {
    throw new SessionNotSetException('Session or pod not available');
  }

  await purgeContainer(paths.team.root(pod), session);
  await deleteSolidDataset(`${paths.root(pod)}/Team`, { fetch: session.fetch });
}

function mapThingToTeam(thing: any): Team {
  return {
    url: thing,
    img: getStringNoLocale(thing, TEAM_SCHEMA.img) ?? '',
    name: getStringNoLocale(thing, TEAM_SCHEMA.name) ?? '',
    tag: getStringNoLocale(thing, TEAM_SCHEMA.tag) ?? '',
    founded: getStringNoLocale(thing, TEAM_SCHEMA.founded) ?? '-',
    location: getStringNoLocale(thing, TEAM_SCHEMA.location) ?? '-',
  };
}
