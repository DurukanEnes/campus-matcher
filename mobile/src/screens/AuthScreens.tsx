import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text } from "react-native";
import { Button, Field, Page, PageHeader } from "../components/DesignSystem";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Page showTabs={false}>
      <PageHeader title="Join the campus" subtitle="Create your member account" onBack={() => navigation.goBack()} />
      <Text style={styles.note}>This prototype uses sample-only forms. Use an @itu.edu.tr address in the real app.</Text>
      <Field label="Your name" value={name} onChangeText={setName} placeholder="How should we call you?" />
      <Field label="İTÜ e-mail" value={email} onChangeText={setEmail} placeholder="name@itu.edu.tr" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry />
      <Button label="Continue to verification" onPress={() => navigation.navigate("VerifyEmail")} />
      <Text style={styles.switch} onPress={() => navigation.navigate("Login")}>Already have an account? Log in</Text>
    </Page>
  );
}

export function VerifyEmailScreen() {
  const navigation = useNavigation<Navigation>();
  const [code, setCode] = useState("");
  return (
    <Page showTabs={false}>
      <PageHeader title="Check your inbox" subtitle="One quick step, then you’re in" onBack={() => navigation.goBack()} />
      <Text style={styles.verifyIcon}>✉</Text>
      <Text style={styles.note}>We sent a six-digit verification code to your İTÜ e-mail. Enter any code here to preview the next step.</Text>
      <Field label="Verification code" value={code} onChangeText={setCode} placeholder="000000" />
      <Button label="Verify and continue" onPress={() => navigation.navigate("Home")} />
      <Text style={styles.switch}>Didn’t get a code? Resend</Text>
    </Page>
  );
}

export function LoginScreen() {
  const navigation = useNavigation<Navigation>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Page showTabs={false}>
      <PageHeader title="Welcome back" subtitle="Pick up where campus left you" onBack={() => navigation.goBack()} />
      <Field label="İTÜ e-mail" value={email} onChangeText={setEmail} placeholder="name@itu.edu.tr" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
      <Button label="Log in to demo" onPress={() => navigation.navigate("Home")} />
      <Text style={styles.switch} onPress={() => navigation.navigate("Register")}>New to CampusMatcher? Create an account</Text>
      <Text style={styles.disclaimer}>Demo only · Sign-in is not connected to an authentication service.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, fontSize: typography.label, lineHeight: 21, marginBottom: spacing.xl },
  switch: { color: colors.primary, fontSize: typography.label, fontWeight: "700", textAlign: "center", marginTop: spacing.xl },
  verifyIcon: { color: colors.primary, fontSize: 46, marginVertical: spacing.xl },
  disclaimer: { color: colors.muted, fontSize: typography.caption, textAlign: "center", marginTop: spacing.lg },
});
