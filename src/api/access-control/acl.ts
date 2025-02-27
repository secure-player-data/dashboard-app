import { Permission } from '@/entities/permissions';
import { Session } from '@inrupt/solid-client-authn-browser';
import * as $rdf from 'rdflib';
import { IAccessControl } from './interfaces';

export class Acl implements IAccessControl {
  private static instance: Acl;

  private constructor() {}

  public static getInstance(): Acl {
    if (!Acl.instance) {
      Acl.instance = new Acl();
    }

    return Acl.instance;
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
    const aclUrl = `${containerUrl}.acl`;
    const aclResponse = await session.fetch(aclUrl, { method: 'GET' });

    if (aclResponse.status === 404) {
      console.log('No ACL file found. Creating a new one.');
      await this.saveNewAcl({
        session,
        aclUrl,
        agentWebId,
        containerUrl,
        modes,
      });
    } else {
      const body = await aclResponse.text();
      await this.updateAcl({
        session,
        aclUrl,
        agentWebId,
        containerUrl,
        modes,
        aclData: body,
      });
    }
  }

  /**
   * Create a new ACL file. The owner of the file is set to the user requesting
   * the update (eg, the user with the web id in the session object).
   * If the user in the 'agentWebId' is different from the on in the session object,
   * a new authorization block is added for this agent ensuring the agent gets
   * to correct permission.
   * @param param0
   */
  private async saveNewAcl({
    session,
    aclUrl,
    agentWebId,
    containerUrl,
    modes,
  }: {
    session: Session;
    aclUrl: string;
    agentWebId: string;
    containerUrl: string;
    modes: Permission[];
  }) {
    let aclContent = `
      <${aclUrl}#owner> a <http://www.w3.org/ns/auth/acl#Authorization>;
        <http://www.w3.org/ns/auth/acl#agent> <${session.info.webId}>;
        <http://www.w3.org/ns/auth/acl#accessTo> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#default> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#mode> <http://www.w3.org/ns/auth/acl#Read>, <http://www.w3.org/ns/auth/acl#Write>, <http://www.w3.org/ns/auth/acl#Control>, <http://www.w3.org/ns/auth/acl#Append>.
    `;

    if (session.info.webId !== agentWebId) {
      const modeTriples = modes
        .map((mode) => `<http://www.w3.org/ns/auth/acl#${mode}>`)
        .join(', ');

      const id1 = crypto.randomUUID();
      const id2 = crypto.randomUUID();

      aclContent += `
      <${aclUrl}#${id1}> a <http://www.w3.org/ns/auth/acl#Authorization>;
        <http://www.w3.org/ns/auth/acl#agent> <${agentWebId}>;
        <http://www.w3.org/ns/auth/acl#accessTo> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#mode> ${modeTriples}.
      `;
      aclContent += `
      <${aclUrl}#${id2}> a <http://www.w3.org/ns/auth/acl#Authorization>;
        <http://www.w3.org/ns/auth/acl#agent> <${agentWebId}>;
        <http://www.w3.org/ns/auth/acl#default> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#mode> ${modeTriples}.
      `;
    }

    const createResponse = await session.fetch(aclUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/turtle',
      },
      body: aclContent.trim(),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Failed to create ACL file: ${createResponse.statusText}`
      );
    }
  }

  private async updateAcl({
    session,
    aclUrl,
    agentWebId,
    containerUrl,
    modes,
    aclData,
  }: {
    session: Session;
    aclUrl: string;
    agentWebId: string;
    containerUrl: string;
    modes: Permission[];
    aclData: string;
  }) {
    const deleteClause = this.getDeleteClause({
      aclData,
      aclUrl,
      containerUrl,
      agentWebId,
    });

    const insertClause = this.getInsertClause({
      aclUrl,
      containerUrl,
      agentWebId,
      modes,
    });

    const sparqlUpdate = `${deleteClause}${insertClause}`.trim();

    const response = await session.fetch(aclUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update',
      },
      body: sparqlUpdate,
    });

    if (!response.ok) {
      throw new Error(`Failed to update ACL: ${response.statusText}`);
    }
  }

  /**
   * Constructs a DELETE DATA sparql query to remove all entries for the agent
   * @param aclData the current data stored in the acl file
   * @param aclUrl the url of the acl file
   * @param containerUrl the url of the container
   * @param agentWebId the webId of the agent to remove
   * @returns
   */
  private getDeleteClause({
    aclData,
    aclUrl,
    containerUrl,
    agentWebId,
  }: {
    aclData: string;
    aclUrl: string;
    containerUrl: string;
    agentWebId: string;
  }) {
    const ACL = $rdf.Namespace('http://www.w3.org/ns/auth/acl#');

    const store = $rdf.graph();

    $rdf.parse(aclData, store, aclUrl, 'text/turtle');

    const agentNode = $rdf.sym(agentWebId);

    const authorizations = store.match(undefined, ACL('agent'), agentNode);

    const blocks = authorizations.map((statement) => {
      const blockNode = statement.subject;
      const blockId = blockNode.value.replace(aclUrl + '#', '');

      const accessTo = store.match(blockNode, ACL('accessTo'), undefined);

      const type = accessTo.length > 0 ? 'accessTo' : 'default';

      const modes = store
        .match(blockNode, ACL('mode'), undefined)
        .map((modeStatement) =>
          modeStatement.object.value.replace(ACL('').value, '')
        );

      return { blockId, type, modes };
    });

    const deleteClause = `
      DELETE DATA {
        ${blocks
          .map((block) => {
            return `
            <${aclUrl}#${block.blockId}> <http://www.w3.org/ns/auth/acl#agent> <${agentWebId}>.
            <${aclUrl}#${block.blockId}> a <http://www.w3.org/ns/auth/acl#Authorization>;
              <http://www.w3.org/ns/auth/acl#${block.type}> <${containerUrl}>;
              <http://www.w3.org/ns/auth/acl#mode> ${block.modes
                .map((mode) => `<http://www.w3.org/ns/auth/acl#${mode}>`)
                .join(', ')}.
          `;
          })
          .join('\n')}
      }
    `;

    return deleteClause;
  }

  /**
   * Constructs an INSERT DATA sparql query to insert entries for the agent with the given modes
   * @param aclUrl the url of the acl file
   * @param containerUrl the url of the container
   * @param agentWebId the webId of the agent to remove
   * @param modes the modes to give the agent
   * @returns
   */
  private getInsertClause({
    aclUrl,
    containerUrl,
    agentWebId,
    modes,
  }: {
    aclUrl: string;
    containerUrl: string;
    agentWebId: string;
    modes: Permission[];
  }) {
    if (modes.length === 0) {
      return '';
    }

    const modeTriples = modes
      .map((mode) => `<http://www.w3.org/ns/auth/acl#${mode}>`)
      .join(', ');

    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    const insertClause = `
    INSERT DATA {
      <${aclUrl}#${id1}> a <http://www.w3.org/ns/auth/acl#Authorization>;
        <http://www.w3.org/ns/auth/acl#accessTo> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#mode> ${modeTriples};
        <http://www.w3.org/ns/auth/acl#agent> <${agentWebId}>.

      <${aclUrl}#${id2}> a <http://www.w3.org/ns/auth/acl#Authorization>;
        <http://www.w3.org/ns/auth/acl#default> <${containerUrl}>;
        <http://www.w3.org/ns/auth/acl#mode> ${modeTriples};
        <http://www.w3.org/ns/auth/acl#agent> <${agentWebId}>.
    }
  `;

    return insertClause;
  }
}
