import { Permission } from '@/entities/permissions';
import { Session } from '@inrupt/solid-client-authn-browser';

export interface IAccessControl {
  /**
   * Updates the permissions of an agent for a container and its children.
   * @param session of the user requesting the update
   * @param containerUrl url to the container
   * @param agentWebId id of the agent to update permissions for
   * @param modes to give the agent.
   */
  updateAgentAccess({
    session,
    containerUrl,
    agentWebId,
    modes,
  }: {
    session: Session;
    containerUrl: string;
    agentWebId: string;
    modes: Permission[];
  }): Promise<void>;
}
