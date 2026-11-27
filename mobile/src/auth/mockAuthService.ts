// In-memory authentication service for WBS-2.3a (UI with mock data).
// It follows the auth rules of FR-01 to FR-03 and the users / email_verifications
// tables; WBS-2.3b replaces it with an Axios implementation of the same interface.

import { isItuEmail, isValidPassword, normalizeEmail, type RegistrationInput } from "./validation";

export type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type AuthErrorCode =
  | "INVALID_EMAIL_DOMAIN"
  | "WEAK_PASSWORD"
  | "EMAIL_TAKEN"
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthError";
    this.code = code;
  }
}

export interface AuthService {
  register(input: RegistrationInput): Promise<{ email: string }>;
  verifyEmail(email: string, code: string): Promise<AuthSession>;
  resendCode(email: string): Promise<void>;
  login(email: string, password: string): Promise<AuthSession>;
}

type StoredUser = AuthUser & { password: string; verified: boolean };
type PendingCode = { code: string; issuedAt: number; wrongAttempts: number };

// FR-02 (v1.1): a code is valid for 10 minutes and for at most 5 wrong attempts.
export const CODE_VALIDITY_MS = 10 * 60 * 1000;
export const MAX_WRONG_ATTEMPTS = 5;

export const DEMO_ACCOUNT = { email: "demo@itu.edu.tr", password: "campus123" };

export function createMockAuthService(
  options: { generateCode?: () => string; now?: () => number } = {},
): AuthService {
  const generateCode = options.generateCode ?? (() => "123456");
  const now = options.now ?? Date.now;
  const users = new Map<string, StoredUser>();
  const pendingCodes = new Map<string, PendingCode>();
  const issueCode = (email: string) =>
    pendingCodes.set(email, { code: generateCode(), issuedAt: now(), wrongAttempts: 0 });
  let nextId = 1;

  const addUser = (email: string, displayName: string, password: string, verified: boolean) => {
    const user: StoredUser = { id: nextId++, email, displayName, role: "USER", password, verified };
    users.set(email, user);
    return user;
  };

  const toSession = ({ password: _password, verified: _verified, ...user }: StoredUser): AuthSession => ({
    accessToken: `mock-token-${user.id}-${Date.now()}`,
    user,
  });

  addUser(DEMO_ACCOUNT.email, "Demo Member", DEMO_ACCOUNT.password, true);

  return {
    async register({ displayName, email, password }) {
      const normalized = normalizeEmail(email);
      if (!isItuEmail(normalized)) throw new AuthError("INVALID_EMAIL_DOMAIN");
      if (!isValidPassword(password)) throw new AuthError("WEAK_PASSWORD");
      if (users.has(normalized)) throw new AuthError("EMAIL_TAKEN");
      addUser(normalized, displayName.trim(), password, false);
      issueCode(normalized);
      return { email: normalized };
    },

    async verifyEmail(email, code) {
      const normalized = normalizeEmail(email);
      const user = users.get(normalized);
      const pending = pendingCodes.get(normalized);
      if (!user || !pending) throw new AuthError("INVALID_CODE");
      if (pending.wrongAttempts >= MAX_WRONG_ATTEMPTS) throw new AuthError("TOO_MANY_ATTEMPTS");
      if (now() - pending.issuedAt >= CODE_VALIDITY_MS) throw new AuthError("CODE_EXPIRED");
      if (pending.code !== code.trim()) {
        pending.wrongAttempts += 1;
        throw new AuthError("INVALID_CODE");
      }
      pendingCodes.delete(normalized);
      user.verified = true;
      return toSession(user);
    },

    async resendCode(email) {
      const normalized = normalizeEmail(email);
      const user = users.get(normalized);
      if (user && !user.verified) issueCode(normalized);
    },

    async login(email, password) {
      const user = users.get(normalizeEmail(email));
      if (!user || user.password !== password) throw new AuthError("INVALID_CREDENTIALS");
      if (!user.verified) throw new AuthError("EMAIL_NOT_VERIFIED");
      return toSession(user);
    },
  };
}
