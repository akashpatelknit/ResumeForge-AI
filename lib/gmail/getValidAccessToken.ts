import "server-only";
import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/crypto/tokenCipher";
import { createOAuthClient } from "@/lib/gmail/oauthClient";

export class GmailNotConnectedError extends Error {
  constructor() {
    super("No Gmail account is connected for this user.");
    this.name = "GmailNotConnectedError";
  }
}

export class GmailReauthRequiredError extends Error {
  constructor(cause?: unknown) {
    super("Gmail connection has expired and needs to be reconnected.");
    this.name = "GmailReauthRequiredError";
    if (cause !== undefined) this.cause = cause;
  }
}

// Refresh proactively once within 5 minutes of expiry rather than waiting
// for an actual 401 from Gmail mid-send.
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.gmailAccount.findUnique({ where: { userId } });
  if (!account) {
    throw new GmailNotConnectedError();
  }

  if (Date.now() < account.tokenExpiresAt.getTime() - REFRESH_BUFFER_MS) {
    return decryptToken(account.accessToken);
  }

  const client = createOAuthClient();
  client.setCredentials({ refresh_token: decryptToken(account.refreshToken) });

  let credentials;
  try {
    ({ credentials } = await client.refreshAccessToken());
  } catch (error) {
    // Most commonly the refresh token was revoked (user removed this app's
    // access in their Google account) or has gone stale from long disuse.
    throw new GmailReauthRequiredError(error);
  }

  if (!credentials.access_token) {
    throw new GmailReauthRequiredError();
  }

  const tokenExpiresAt = credentials.expiry_date
    ? new Date(credentials.expiry_date)
    : new Date(Date.now() + 55 * 60 * 1000);

  await prisma.gmailAccount.update({
    where: { userId },
    data: {
      accessToken: encryptToken(credentials.access_token),
      // Google doesn't always issue a new refresh_token on refresh — only
      // overwrite the stored one if a new one actually came back.
      ...(credentials.refresh_token ? { refreshToken: encryptToken(credentials.refresh_token) } : {}),
      tokenExpiresAt,
    },
  });

  return credentials.access_token;
}
