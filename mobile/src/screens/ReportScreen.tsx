import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Chip, Field, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ReportRoute = RouteProp<RootStackParamList, "Report">;

const reasons = ["Harassment", "Inappropriate content", "Spam", "Other"];

export default function ReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ReportRoute>();
  const { activities } = usePrototypeData();
  const activity = route.params?.activityId
    ? activities.find((item) => item.id === route.params?.activityId)
    : undefined;
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const submit = () => {
    if (!reason) {
      Alert.alert("Choose a reason", "Select the option that best describes your concern.");
      return;
    }
    Alert.alert("Report received", "Your report is private. An administrator will review it.");
    navigation.goBack();
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Let us know" subtitle="Reports are private" onBack={() => navigation.goBack()} />
      {activity ? (
        <View style={styles.target}>
          <Text style={styles.targetLabel}>REPORTING AN ACTIVITY</Text>
          <Text style={styles.targetName}>{activity.category} · {activity.venue}</Text>
        </View>
      ) : (
        <Text style={styles.intro}>Tell us what happened. If there’s an immediate risk, contact campus support.</Text>
      )}
      <SectionTitle title="What’s going on?" />
      <View style={styles.reasonList}>
        {reasons.map((item) => (
          <Chip key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />
        ))}
      </View>
      <View style={styles.details}>
        <Field
          label="Anything else we should know?"
          value={details}
          onChangeText={setDetails}
          placeholder="Share only the details needed to review this report."
          multiline
        />
      </View>
      <View style={styles.privacy}>
        <Text style={styles.privacyIcon}>⊙</Text>
        <Text style={styles.privacyCopy}>The person you report will not see who submitted the report.</Text>
      </View>
      <Button label="Submit private report" onPress={submit} />
      <Text style={styles.footnote}>Prototype only · No report is sent or stored.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  target: { padding: spacing.lg, borderRadius: 16, backgroundColor: colors.primarySoft },
  targetLabel: { color: colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  targetName: { color: colors.ink, fontSize: typography.label, fontWeight: "700", marginTop: spacing.sm },
  intro: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  reasonList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  details: { marginTop: spacing.xl },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface, marginBottom: spacing.lg },
  privacyIcon: { color: colors.primary, fontSize: 20 },
  privacyCopy: { flex: 1, color: colors.muted, fontSize: typography.caption, lineHeight: 17 },
  footnote: { color: colors.muted, textAlign: "center", fontSize: 10, marginTop: spacing.md },
});
