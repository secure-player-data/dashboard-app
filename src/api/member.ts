import {
  ActorWithPermissions,
  Member,
  MemberWithPermissions,
} from '@/entities/data/member';
import { Session } from '@inrupt/solid-client-authn-browser';
import { fetchTeamUrl } from './team';
import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { safeCall } from '@/utils';
import { TeamNotFoundException } from '@/exceptions/team-exceptions';
import {
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getThingAll,
  getUrl,
} from '@inrupt/solid-client';
import { RDF } from '@inrupt/vocab-common-rdf';
import { BASE_APP_CONTAINER, DATA_CONTAINER } from './paths';
import { getAgentAccessAll, updateAgentAccess } from './access-control';
import { Permission } from '@/entities/permissions';
import { PROFILE_SCHEMA } from '@/schemas/profile';
import { TEAM_MEMBER_SCHEMA } from '@/schemas/team';

/**
 * Returns member details of a player
 * @param session of the user requesting the details
 * @param pod of the user to get the details from
 */
export async function fetchMember(
  session: Session | null,
  pod: string | null
): Promise<Member> {
  if (!session || !pod) {
    throw new SessionNotSetException('No session provided');
  }

  const [teamUrlError, teamUrl] = await safeCall(fetchTeamUrl(session, pod));

  if (teamUrlError) {
    throw new TeamNotFoundException('You are not part of a team.');
  }

  const [datasetError, teamDataset] = await safeCall(
    getSolidDataset(teamUrl, { fetch: session.fetch })
  );

  if (datasetError) {
    throw new TeamNotFoundException('Team dataset not found');
  }

  const memberThings = getThingAll(teamDataset).filter((thing) => {
    const membePod = getStringNoLocale(thing, TEAM_MEMBER_SCHEMA.pod);
    return membePod === pod;
  })[0];

  const [nameError, name] = await safeCall(fetchMemberName(pod, session));

  if (nameError) {
    throw new Error('Failed to fetch member name');
  }

  return {
    webId: getStringNoLocale(memberThings, TEAM_MEMBER_SCHEMA.webId) ?? '',
    pod,
    name,
    role: getStringNoLocale(memberThings, TEAM_MEMBER_SCHEMA.role) ?? '',
  };
}

/**
 * Returns a list of members in the team of the user with the specified pod
 * @param session of the requesting user
 * @param pod pod url of the user to fetch the members from
 */
export async function fetchMembers(
  session: Session | null,
  pod: string | null
): Promise<Member[]> {
  if (!session) {
    throw new SessionNotSetException('No session provided');
  }

  const [teamUrlError, teamUrl] = await safeCall(fetchTeamUrl(session, pod));

  if (teamUrlError) {
    throw new TeamNotFoundException(
      'You are not part of a team. Create or join one to see members.'
    );
  }

  const [datasetError, teamDataset] = await safeCall(
    getSolidDataset(teamUrl, { fetch: session.fetch })
  );

  if (datasetError) {
    throw new TeamNotFoundException('Team dataset not found');
  }

  const teamThings = getThingAll(teamDataset);

  const teamMembers = teamThings.filter((thing) => {
    const type = getUrl(thing, RDF.type);
    return type === TEAM_MEMBER_SCHEMA.type;
  });

  const members = await Promise.all(
    teamMembers.map(async (member) => {
      const webId = getStringNoLocale(member, TEAM_MEMBER_SCHEMA.webId) ?? '';
      const podUrl = getStringNoLocale(member, TEAM_MEMBER_SCHEMA.pod) ?? '';
      const [err, name] = await safeCall(fetchMemberName(podUrl, session));

      return {
        webId,
        name: err ? 'unknown' : name,
        role: getStringNoLocale(member, TEAM_MEMBER_SCHEMA.role) ?? '',
        pod: podUrl,
      };
    })
  );

  return members;
}

/**
 * Returns a list of members in the team of the requesting user. The members
 * contains their permissions to the requesting users pod.
 * @param session of the requesting user
 * @param pod pod url of the user to fetch the members from
 * @returns list of members with their permission rights to the
 * requesting user
 */
export async function fetchMembersWithPermissions(
  session: Session | null,
  pod: string | null
): Promise<MemberWithPermissions[]> {
  if (!session || !pod) {
    throw new SessionNotSetException('No session provided');
  }

  const members = await fetchMembers(session, pod);

  const membersAccessMap = await getAgentAccessAll({
    session,
    url: `${pod}${BASE_APP_CONTAINER}/${DATA_CONTAINER}`,
  });

  const membersWithPermissions = members.map((member) => {
    const accesses = membersAccessMap && membersAccessMap[member.webId];

    return {
      ...member,
      permissions: {
        read: accesses?.read ?? false,
        write: accesses?.write ?? false,
        append: accesses?.append ?? false,
        control: accesses?.controlRead ?? false,
      },
    };
  });

  return membersWithPermissions;
}

/**
 * Updates the permissions of the members for the requesting user
 * @param members object containing the members and their new permissions
 * @param session of the requesting user
 * @param pod pod url of the user to update the permissions for
 */
export async function updateActorPermissions(
  member:
    | MemberWithPermissions
    | ActorWithPermissions
    | MemberWithPermissions[],
  session: Session | null,
  pod: string | null
) {
  if (!session) {
    throw new SessionNotSetException('No session provided');
  }

  const members = Array.isArray(member) ? member : [member];

  for (const singleMember of members) {
    // Check if it's the same user as the session user
    if (singleMember.webId === session.info.webId) {
      console.log('Cannot update own permissions');
      continue; // Skip this member if it's the same as the session user
    }

    const modes = [] as Permission[];

    // Check for permissions and add them to the modes array
    if (singleMember.permissions.read) {
      modes.push('Read');
    }
    if (singleMember.permissions.write) {
      modes.push('Write');
    }
    if (singleMember.permissions.append) {
      modes.push('Append');
    }
    if (singleMember.permissions.control) {
      modes.push('Control');
    }

    // Update the agent's permissions for each member
    await updateAgentAccess({
      session,
      agentWebId: singleMember.webId,
      containerUrl: pod!,
      modes,
    });
  }
}

/**
 * Fetches the name of a member
 * @param podUrl url to the members pod
 * @param session of the requesting user
 * @returns name of the member
 */
async function fetchMemberName(podUrl: string, session: Session) {
  const profileUrl = `${podUrl}${BASE_APP_CONTAINER}/Profile`;
  const [profileError, profileDataset] = await safeCall(
    getSolidDataset(profileUrl, {
      fetch: session.fetch,
    })
  );

  if (profileError) {
    throw new Error(
      `Failed to find member with pod ${podUrl}: ${profileError}`
    );
  }

  const profileThing = getThing(profileDataset, `${profileUrl}#profile`);

  if (!profileThing) {
    throw new Error(`Failed to find profile details for ${podUrl}`);
  }

  const name = getStringNoLocale(profileThing, PROFILE_SCHEMA.name) ?? '';

  return name;
}
