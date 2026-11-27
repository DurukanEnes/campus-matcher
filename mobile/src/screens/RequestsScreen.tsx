import { useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card, Chip, Page, PageHeader, SectionTitle, Tag } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type RequestsRoute = RouteProp<RootStackParamList, "Requests">;
type RequestTab = "Incoming" | "Sent";

export default function RequestsScreen() {
  const navigation = useNavigation<Navigation>();
  const { activities, requests, updateRequest } = usePrototypeData();
  const route = useRoute<RequestsRoute>();
  const [tab, setTab] = useState<RequestTab>(route.params?.tab ?? "Incoming");
  const visibleRequests = useMemo(
    () => requests.filter((request) =>
      tab === "Incoming" ? request.direction === "incoming" : request.direction === "outgoing",
    ),
    [requests, tab],
  );

  return (
    <Page activeTab="Requests" onTabSelect={(name) => navigation.navigate(name)}>
      <PageHeader title="A little inbox" subtitle="Good things start with hello" />
      <View style={styles.tabs}>
        {(["Incoming", "Sent"] as const).map((name) => (
          <Chip key={name} label={name} selected={tab === name} onPress={() => setTab(name)} />
        ))}
      </View>
      {visibleRequests.length ? visibleRequests.map((request) => {
        const activity = activities.find((item) => item.id === request.activityId);
        const isPending = request.status === "pending";
        const isIncoming = request.direction === "incoming";
        return (
          <Card key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Avatar initials={request.initials} size={46} tone={isIncoming ? "lavender" : "green"} />
              <View style={styles.requestIdentity}>
                <Text style={styles.name}>{request.requester}</Text>
                <Text style={styles.when}>
                  {isIncoming ? `${request.requesterDepartment} · İTÜ member` : `To ${activity?.host ?? "the host"}`}
                </Text>
              </View>
              <Tag
                label={request.status.toUpperCase()}
                tone={request.status === "accepted" ? "green" : request.status === "declined" ? "muted" : "peach"}
              />
            </View>
            <View style={styles.activitySummary}>
              <Text style={styles.activityLabel}>{activity?.category ?? "Activity"} · {activity?.venue ?? "Campus"}</Text>
              <Text style={styles.activityTime}>{activity?.date ?? "Today"} · {activity?.time ?? "Time to confirm"}</Text>
            </View>
            <Text style={styles.message}>“{request.message}”</Text>
            {isPending && isIncoming ? (
              <View style={styles.actions}>
                <Button
                  label="Accept & open chat"
                  icon="✓"
                  onPress={() => {
                    updateRequest(request.id, "accepted");
                    navigation.navigate("Chat", { activityId: request.activityId });
                  }}
                />
                <Button label="Decline" variant="quiet" onPress={() => updateRequest(request.id, "declined")} />
              </View>
            ) : request.status === "pending" ? (
              <Text style={styles.waiting}>Waiting for {activity?.host ?? "the host"} to answer.</Text>
            ) : request.status === "accepted" ? (
              <Button label="Open activity chat" variant="secondary" onPress={() => navigation.navigate("Chat", { activityId: request.activityId })} />
            ) : null}
          </Card>
        );
      }) : (
        <View style={styles.empty}>
          <Text style={styles.emptyGlyph}>♡</Text>
          <Text style={styles.emptyTitle}>No {tab.toLowerCase()} requests yet.</Text>
          <Text style={styles.emptyCopy}>When someone reaches out, you’ll find it here.</Text>
        </View>
      )}
      <SectionTitle title="A note on matching" />
      <Text style={styles.footnote}>A match is for one activity only. There are no friend requests or lasting connections.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  requestCard: { marginBottom: spacing.md, padding: spacing.lg },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  requestIdentity: { flex: 1 },
  name: { color: colors.ink, fontSize: typography.body, fontWeight: "700" },
  when: { color: colors.muted, fontSize: typography.caption, marginTop: spacing.xs },
  activitySummary: { padding: spacing.md, backgroundColor: colors.canvas, borderRadius: radii.md, marginTop: spacing.lg },
  activityLabel: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  activityTime: { color: colors.muted, fontSize: typography.caption, marginTop: spacing.xs },
  message: { color: colors.ink, fontSize: typography.label, lineHeight: 21, marginVertical: spacing.lg },
  actions: { gap: spacing.xs },
  waiting: { color: colors.muted, fontSize: typography.caption },
  empty: { alignItems: "center", padding: spacing.xxxl, borderRadius: radii.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  emptyGlyph: { color: colors.primary, fontSize: 30, marginBottom: spacing.md },
  emptyTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "700", textAlign: "center" },
  emptyCopy: { color: colors.muted, fontSize: typography.label, lineHeight: 20, textAlign: "center", marginTop: spacing.sm },
  footnote: { color: colors.muted, fontSize: typography.label, lineHeight: 21, marginTop: spacing.sm },
});
