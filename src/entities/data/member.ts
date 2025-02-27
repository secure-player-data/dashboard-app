export type Member = {
  webId: string;
  pod: string;
  name: string;
  role: string;
};

export type MemberWithPermissions = Member & {
  permissions: {
    read: boolean;
    write: boolean;
    append: boolean;
    control: boolean;
  };
};
