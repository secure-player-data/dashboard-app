import { Permission } from './permissions';

export type AccessHistory = {
  webId: string;
  resource: string;
  action: Permission;
  time: Date;
};
