import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { AuthError, type AuthErrorCode } from "../auth/mockAuthService";
import {
  normalizeEmail,
  PASSWORD_RULE,
  validateLogin,
  validateRegistration,
  validateVerificationCode,
  type FieldErrors,
  type LoginInput,
  type RegistrationInput,
} from "../auth/validation";
import { Button, Field, Page, PageHeader } from "../components/DesignSystem";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const errorMessages: Record<AuthErrorCode, string> = {
  INVALID_EMAIL_DOMAIN: "Only @itu.edu.tr addresses can register.",
  WEAK_PASSWORD: PASSWORD_RULE,
  EMAIL_TAKEN: "An account with this e-mail already exists. Log in instead.",
  INVALID_CODE: "The code is wrong or expired. Use the latest code or request a new one.",
  CODE_EXPIRED: "This code has expired. Request a new code.",
  TOO_MANY_ATTEMPTS: "Too many wrong codes. Request a new code.",
  INVALID_CREDENTIALS: "E-mail or password is wrong.",
  EMAIL_NOT_VERIFIED: "Verify your e-mail before logging in.",
};

const unexpectedError = "Something went wrong. Please try again.";

function errorCode(error: unknown): AuthErrorCode | undefined {
  return error instanceof AuthError ? error.code : undefined;
}

function messageFor(error: unknown): string {
  const code = errorCode(error);
  return code ? errorMessages[code] : unexpectedError;
}

const goHome = (navigation: Navigation) => navigation.reset({ index: 0, routes: [{ name: "Home" }] });

function FormMessage({ text, tone = "error" }: { text?: string; tone?: "error" | "info" }) {
  if (!text) return null;
  return (
    <Text accessibilityRole="alert" style={[styles.message, tone === "error" ? styles.messageError : styles.messageInfo]}>
      {text}
    </Text>
  );
}

export function RegisterScreen() {
  const navigation = useNavigation<Navigation>();
  const { service } = useAuth();
  const [form, setForm] = useState<RegistrationInput>({ displayName: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<RegistrationInput>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof RegistrationInput) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const fieldErrors = validateRegistration(form);
    setErrors(fieldErrors);
    setFormError(undefined);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { email } = await service.register({ ...form, email: normalizeEmail(form.email) });
      navigation.navigate("VerifyEmail", { email });
    } catch (error) {
      const code = errorCode(error);
      if (code === "INVALID_EMAIL_DOMAIN" || code === "EMAIL_TAKEN") setErrors({ email: errorMessages[code] });
      else if (code === "WEAK_PASSWORD") setErrors({ password: errorMessages[code] });
      else setFormError(messageFor(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Join the campus" subtitle="Create your member account" onBack={() => navigation.goBack()} />
      <Text style={styles.note}>CampusMatcher is open to İTÜ students and staff with an @itu.edu.tr address.</Text>
      <Field label="Your name" value={form.displayName} onChangeText={update("displayName")} placeholder="How should we call you?" error={errors.displayName} />
      <Field label="İTÜ e-mail" value={form.email} onChangeText={update("email")} placeholder="name@itu.edu.tr" keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={form.password} onChangeText={update("password")} placeholder="At least 8 characters" secureTextEntry error={errors.password} />
      <FormMessage text={formError} />
      <Button label={submitting ? "Creating account…" : "Continue to verification"} onPress={submit} disabled={submitting} />
      <Text accessibilityRole="link" style={styles.switch} onPress={() => navigation.navigate("Login")}>
        Already have an account? Log in
      </Text>
    </Page>
  );
}

export function VerifyEmailScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParamList, "VerifyEmail">>();
  const { service, signIn } = useAuth();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const verify = async () => {
    const error = validateVerificationCode(code);
    setCodeError(error);
    setInfo(undefined);
    if (error) return;

    setSubmitting(true);
    try {
      signIn(await service.verifyEmail(params.email, code.trim()));
      goHome(navigation);
    } catch (verifyError) {
      setCodeError(messageFor(verifyError));
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setCodeError(undefined);
    try {
      await service.resendCode(params.email);
      setInfo("A new code is on its way. The previous code no longer works.");
    } catch (resendError) {
      setCodeError(messageFor(resendError));
    }
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Check your inbox" subtitle="One quick step, then you’re in" onBack={() => navigation.goBack()} />
      <Text style={styles.verifyIcon}>✉</Text>
      <Text style={styles.note}>We sent a six-digit verification code to {params.email}.</Text>
      <Field label="Verification code" value={code} onChangeText={setCode} placeholder="000000" keyboardType="number-pad" error={codeError} />
      <FormMessage text={info} tone="info" />
      <Button label={submitting ? "Verifying…" : "Verify and continue"} onPress={verify} disabled={submitting} />
      <Button label="Resend code" variant="quiet" onPress={resend} disabled={submitting} />
    </Page>
  );
}

export function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const { service, signIn } = useAuth();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<LoginInput>>({});
  const [formError, setFormError] = useState<string>();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof LoginInput) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const fieldErrors = validateLogin(form);
    setErrors(fieldErrors);
    setFormError(undefined);
    setUnverifiedEmail(undefined);
    if (Object.keys(fieldErrors).length > 0) return;

    const email = normalizeEmail(form.email);
    setSubmitting(true);
    try {
      signIn(await service.login(email, form.password));
      goHome(navigation);
    } catch (error) {
      setFormError(messageFor(error));
      if (errorCode(error) === "EMAIL_NOT_VERIFIED") setUnverifiedEmail(email);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Welcome back" subtitle="Pick up where campus left you" onBack={() => navigation.goBack()} />
      <Field label="İTÜ e-mail" value={form.email} onChangeText={update("email")} placeholder="name@itu.edu.tr" keyboardType="email-address" error={errors.email} />
      <Field label="Password" value={form.password} onChangeText={update("password")} placeholder="Your password" secureTextEntry error={errors.password} />
      <FormMessage text={formError} />
      {unverifiedEmail ? (
        <Button label="Enter verification code" variant="secondary" onPress={() => navigation.navigate("VerifyEmail", { email: unverifiedEmail })} />
      ) : null}
      <Button label={submitting ? "Logging in…" : "Log in"} onPress={submit} disabled={submitting} />
      <Text accessibilityRole="link" style={styles.switch} onPress={() => navigation.navigate("Register")}>
        New to CampusMatcher? Create an account
      </Text>
      <Text style={styles.disclaimer}>Mock data · Sign-in connects to the API in WBS-2.3b.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: typography.label, lineHeight: 21, marginBottom: spacing.xl },
  switch: { color: colors.primary, fontSize: typography.label, fontWeight: "700", textAlign: "center", marginTop: spacing.xl },
  verifyIcon: { color: colors.primary, fontSize: 46, marginVertical: spacing.xl },
  disclaimer: { color: colors.muted, fontSize: typography.caption, textAlign: "center", marginTop: spacing.lg },
  message: { borderRadius: radii.md, fontSize: typography.label, marginBottom: spacing.lg, padding: spacing.md },
  messageError: { backgroundColor: colors.dangerSoft, color: colors.danger },
  messageInfo: { backgroundColor: colors.primarySoft, color: colors.primary },
});
