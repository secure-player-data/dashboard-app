import { SessionNotSetException } from '@/exceptions/session-exceptions';
import { Session } from '@inrupt/solid-client-authn-browser';

export async function uploadPlayerData(session: Session | null) {
  // Check for null
  if (!session) {
    throw new SessionNotSetException('No session when uploading player data');
  }

  // Send upload data to player pod

  // Send information to player inbox
}
