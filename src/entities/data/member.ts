export type Actor = {
  webId: string;
};

export type MemberWithPermissions = Member & {
  permissions: {
    read: boolean;
    write: boolean;
    append: boolean;
    control: boolean;
  };
};

export type ActorWithPermissions = Actor & {
  permissions: {
    read: boolean;
    write: boolean;
    append: boolean;
    control: boolean;
  };
};

export type Member = Actor & {
  pod: string;
  name: string;
  role: string;
};
