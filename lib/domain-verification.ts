// Helpers for domain verification tokens
import crypto from 'crypto';

export function generateVerificationToken() {
  return crypto.randomBytes(20).toString('hex');
}

export async function checkDomainDns(domain: string, token: string) {
  // Basic DNS TXT check — best-effort, may not work on constrained runtimes
  // This function tries to resolve TXT records and looks for the token.
  try {
    const res = await import('dns').then((d) => d.promises.resolveTxt(domain));
    for (const entry of res) {
      for (const txt of entry) {
        if (txt.includes(token)) return true;
      }
    }
    return false;
  } catch (e) {
    console.warn('DNS check failed', e);
    return false;
  }
}
