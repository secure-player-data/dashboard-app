import { Team } from './team';

export type Profile = {
  name: string;
  webId: string;
  email: string;
  team: Team | null;
  picture: string;
};
