import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Card, Chip, Field, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import { CURRENT_MEMBER_ID, usePrototypeData } from "../prototype/PrototypeData";
import type { ReportReason } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ReportRoute = RouteProp<RootStackParamList, "Report">;

export const reportReasons: ReportReason[] = ["Harassment", "Spam", "Inappropriate behavior", "Other"];

export default function ReportScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ReportRoute>();
  const { activities, members, submitReport } = usePrototypeData();
  const activity = route.params?.activityId
    ? activities.find((item) => item.id === route.params?.activityId)
    : undefined;
  // A post report is about the post's host (FR-21); a member report names the member directly.
  const memberId = activity?.hostId ?? route.params?.memberId;
  const member = memberId ? members[memberId] : undefined;
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  if (!member || member.id === CURRENT_MEMBER_ID) {
    return (
      <Page showTabs={false}>
        <PageHeader title="Let us know" subtitle="Reports are private" onBack={() => navigation.goBack()} />
        <Card style={styles.missing}>
          <Text style={styles.missingTitle}>
            {member ? "You can’t report yourself" : "Choose who to report"}
          </Text>
          <Text style={styles.missingCopy}>
            Open the member’s profile or their activity and tap Report. That way the administrator knows exactly what to review.
          </Text>
        </Card>
      </Page>
    );
  }

  const submit = () => {
    if (!reason) return;
    const sent = submitReport({
      reportedMemberId: member.id,
      activityId: activity?.id,
      reason,
      details: details.trim(),
    });
    if (sent) {
      Alert.alert("Report received", "Your report is private. An administrator will review it.");
      navigation.goBack();
    }
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Let us know" subtitle="Reports are private" onBack={() => navigation.goBack()} />
      <View style={styles.target}>
        <Text style={styles.targetLabel}>{activity ? "REPORTING AN ACTIVITY" : "REPORTING A MEMBER"}</Text>
        <Text style={styles.targetName}>
          {activity ? `${activity.category} · ${activity.venue}` : member.name}
        </Text>
        {activity ? <Text style={styles.targetMeta}>Posted by {member.name}</Text> : null}
      </View>
      <SectionTitle title="What’s going on?" />
      <View style={styles.reasonList}>
        {reportReasons.map((item) => (
          <Chip key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />
        ))}
      </View>
      <View style={styles.details}>
        <Field
          label="Anything else we should know?"
          value={details}
          onChangeText={setDetails}
          placeholder="Optional. Share only the details needed to review this report."
          multiline
        />
      </View>
      <View style={styles.privacy}>
        <Text style={styles.privacyIcon}>⊙</Text>
        <Text style={styles.privacyCopy}>The person you report will not see who submitted the report.</Text>
      </View>
      <Button label="Submit private report" onPress={submit} disabled={!reason} />
      {!reason ? <Text style={styles.hint}>Choose a reason to continue.</Text> : null}
      <Text style={styles.footnote}>Prototype only · Reports stay on this device.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  target: { padding: spacing.lg, borderRadius: 16, backgroundColor: colors.primarySoft },
  targetLabel: { color: colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 1.2 },
  targetName: { color: colors.ink, fontSize: typography.label, fontWeight: "700", marginTop: spacing.sm },
  targetMeta: { color: colors.muted, fontSize: typography.caption, marginTop: spacing.xs },
  missing: { gap: spacing.sm },
  missingTitle: { color: colors.ink, fontSize: typography.body, fontWeight: "700" },
  missingCopy: { color: colors.muted, fontSize: typography.label, lineHeight: 20 },
  reasonList: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  details: { marginTop: spacing.xl },
  privacy: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: 14, backgroundColor: colors.surface, marginBottom: spacing.lg },
  privacyIcon: { color: colors.primary, fontSize: 20 },
  privacyCopy: { flex: 1, color: colors.muted, fontSize: typography.caption, lineHeight: 17 },
  hint: { color: colors.muted, textAlign: "center", fontSize: typography.caption, marginTop: spacing.sm },
  footnote: { color: colors.muted, textAlign: "center", fontSize: 10, marginTop: spacing.md },
});
