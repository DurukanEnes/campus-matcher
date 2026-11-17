import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { BrandMark, Button, Page } from "../components/DesignSystem";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <Page showTabs={false}>
      <View style={styles.logoRow}>
        <BrandMark size={50} />
        <Text style={styles.brand}>CampusMatcher</Text>
      </View>
      <View style={styles.art}>
        <View style={styles.sun} />
        <View style={styles.buildingOne}><View style={styles.windowRow}><View style={styles.window} /><View style={styles.window} /><View style={styles.window} /></View></View>
        <View style={styles.buildingTwo}><View style={styles.windowRow}><View style={styles.window} /><View style={styles.window} /><View style={styles.window} /></View></View>
        <View style={styles.ground} />
        <View style={styles.personOne}><View style={styles.personHead} /><View style={styles.personBody} /></View>
        <View style={styles.personTwo}><View style={styles.personHead} /><View style={styles.personBody} /></View>
        <View style={styles.artCaption}><Text style={styles.artCaptionText}>A CAMPUS THAT FEELS CLOSER</Text></View>
      </View>
      <Text style={styles.eyebrow}>YOUR PEOPLE ARE HERE</Text>
      <Text style={styles.title}>Make room for{`\n`}a good hello.</Text>
      <Text style={styles.copy}>Find a study buddy, gym partner, or someone to share a campus lunch with.</Text>
      <View style={styles.actions}>
        <Button label="Create an account" onPress={() => navigation.navigate("Register")} />
        <Button label="Log in" variant="secondary" onPress={() => navigation.navigate("Login")} />
      </View>
      <Text style={styles.finePrint}>For verified İTÜ students and staff · No GPS required</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingTop: spacing.md },
  brand: { color: colors.ink, fontSize: typography.heading, fontWeight: "800" },
  art: { height: 245, marginTop: spacing.xl, borderRadius: radii.lg, overflow: "hidden", backgroundColor: colors.primarySoft, position: "relative" },
  sun: { position: "absolute", right: 44, top: 28, width: 52, height: 52, borderRadius: 26, backgroundColor: colors.lime },
  buildingOne: { position: "absolute", left: 36, bottom: 46, width: 120, height: 110, backgroundColor: "#B7D7C2", borderTopLeftRadius: 9, borderTopRightRadius: 9 },
  buildingTwo: { position: "absolute", left: 151, bottom: 46, width: 135, height: 151, backgroundColor: colors.primary, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  windowRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 22 },
  window: { width: 14, height: 17, borderRadius: 4, backgroundColor: "#E5F1E9" },
  ground: { position: "absolute", bottom: 0, left: 0, right: 0, height: 47, backgroundColor: "#D0E6D8" },
  personOne: { position: "absolute", left: 83, bottom: 32, alignItems: "center" },
  personTwo: { position: "absolute", right: 84, bottom: 31, alignItems: "center" },
  personHead: { width: 19, height: 19, borderRadius: 10, backgroundColor: "#E8AC8B" },
  personBody: { width: 27, height: 53, marginTop: 2, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: colors.peach },
  artCaption: { position: "absolute", left: spacing.lg, top: spacing.lg, borderRadius: radii.pill, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  artCaptionText: { color: colors.primary, fontSize: 9, letterSpacing: 1.2, fontWeight: "800" },
  eyebrow: { color: colors.primary, fontSize: typography.caption, letterSpacing: 1.6, fontWeight: "800", marginTop: spacing.xl },
  title: { color: colors.ink, fontSize: typography.display, lineHeight: 39, fontWeight: "800", letterSpacing: -1, marginTop: spacing.sm },
  copy: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.xl },
  finePrint: { color: colors.muted, fontSize: typography.caption, textAlign: "center", marginTop: spacing.lg },
});
