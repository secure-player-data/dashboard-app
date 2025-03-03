export type resource = {
  path: string;
  type: string;
  accessLevel: string;
};
export type permissionDetail = {
  agent: string;
  read: boolean;
  write: boolean;
  append: boolean;
  control: boolean;
};
