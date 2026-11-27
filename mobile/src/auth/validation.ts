// Client-side checks for the authentication forms (FR-01, FR-02, FR-03).
// The backend repeats every check; these only give the user feedback early.

const ITU_EMAIL = /^[^\s@]+@itu\.edu\.tr$/;
const SIX_DIGITS = /^\d{6}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// FR-01 (v1.1): at least 8 characters with at least one letter and one digit.
export function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && /\p{L}/u.test(password) && /\d/.test(password);
}

export const PASSWORD_RULE = `Use at least ${MIN_PASSWORD_LENGTH} characters with a letter and a digit.`;

export function isItuEmail(email: string): boolean {
  return ITU_EMAIL.test(normalizeEmail(email));
}

export type RegistrationInput = { displayName: string; email: string; password: string };
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function validateRegistration(input: RegistrationInput): FieldErrors<RegistrationInput> {
  const errors: FieldErrors<RegistrationInput> = {};
  if (!input.displayName.trim()) errors.displayName = "Enter your name.";
  if (!isItuEmail(input.email)) errors.email = "Only @itu.edu.tr addresses can register.";
  if (!isValidPassword(input.password)) errors.password = PASSWORD_RULE;
  return errors;
}

export type LoginInput = { email: string; password: string };

export function validateLogin(input: LoginInput): FieldErrors<LoginInput> {
  const errors: FieldErrors<LoginInput> = {};
  if (!isItuEmail(input.email)) errors.email = "Enter your @itu.edu.tr address.";
  if (!input.password) errors.password = "Enter your password.";
  return errors;
}

export function validateVerificationCode(code: string): string | undefined {
  return SIX_DIGITS.test(code.trim()) ? undefined : "Enter the 6-digit code.";
}
