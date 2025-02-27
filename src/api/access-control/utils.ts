import { Session } from '@inrupt/solid-client-authn-browser';
import { IAccessControl } from './interfaces';
import { safeCall } from '@/utils';
import { isAcpControlled } from '@inrupt/solid-client/acp/acp';
import { Acp } from './acp';
import { Acl } from './acl';

/**
 * Returns the correct access control service based on the protocol used
 * by the user's pod provider
 * @param session of the user requesting the access control service
 * @param containerUrl url to the container to get the access control service for
 */
export async function getAccessControlService(
  session: Session,
  containerUrl: string
): Promise<IAccessControl> {
  const [err, usesAcp] = await safeCall(
    isAcpControlled(containerUrl, { fetch: session.fetch })
  );
  if (err) {
    throw new Error('Error checking if ACP is used');
  }

  if (usesAcp) {
    return Acp.getInstance();
  }
  return Acl.getInstance();
}
