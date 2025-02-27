import { Session } from '@inrupt/solid-client-authn-browser';
import { IAccessControl } from './interfaces';
import { Permission } from '@/entities/permissions';
import { setAgentAccess } from '@inrupt/solid-client/universal';
import { getSolidDataset } from '@inrupt/solid-client';

export class Acp implements IAccessControl {
  private static instance: Acp;

  private constructor() {}

  public static getInstance(): Acp {
    if (!Acp.instance) {
      Acp.instance = new Acp();
    }

    return Acp.instance;
  }

  async updateAgentAccess({
    session,
    containerUrl,
    agentWebId,
    modes,
  }: {
    session: Session;
    containerUrl: string;
    agentWebId: string;
    modes: Permission[];
  }): Promise<void> {
    await setAgentAccess(
      containerUrl,
      agentWebId,
      {
        read: modes.includes('Read'),
        write: modes.includes('Write'),
        append: modes.includes('Append'),
        controlWrite: modes.includes('Control'),
        controlRead: modes.includes('Control'),
      },
      { fetch: session.fetch }
    );
    this.setUpInheritance(session, containerUrl);
  }

  private async setUpInheritance(session: Session, containerUrl: string) {
    const container = await getSolidDataset(containerUrl, {
      fetch: session.fetch,
    });

    const acrUrl = container.internal_resourceInfo.aclUrl!;

    const defaultAcrAccess = `${acrUrl}#defaultAcrAccessControl`;
    const defaultAccess = `${acrUrl}#defaultAccessControl`;

    const updateClause = `
      INSERT DATA {
        <${acrUrl}> <http://www.w3.org/ns/solid/acp#memberAccessControl> 
          <${defaultAccess}>, <${defaultAcrAccess}> .
      }`;
    const inheritanceSetupResponse = await session.fetch(acrUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update',
      },
      body: updateClause,
    });

    if (!inheritanceSetupResponse.ok) {
      throw new Error(
        `Failed to create ACL file: ${inheritanceSetupResponse.statusText}`
      );
    }
  }
}
