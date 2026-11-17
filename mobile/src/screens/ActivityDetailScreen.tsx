import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Avatar, Button, Card, Field, Page, PageHeader, Tag } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type DetailRoute = RouteProp<RootStackParamList, "ActivityDetail">;

export default function ActivityDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<DetailRoute>();
  const { activities, sendRequest } = usePrototypeData();
  const [message, setMessage] = useState("Hi! I’d love to join you.");
  const activity = activities.find((item) => item.id === route.params.activityId) ?? activities[0];

  if (!activity) {
    return (
      <Page showTabs={false}>
        <PageHeader title="Plan not found" onBack={() => navigation.goBack()} />
        <Button label="Back to activities" onPress={() => navigation.navigate("ActivityFeed")} />
      </Page>
    );
  }

  const request = () => {
    if (!message.trim()) {
      Alert.alert("Add a short hello", "Write a message to introduce yourself.");
      return;
    }
    sendRequest(activity.id, message.trim());
    navigation.navigate("Requests");
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="A plan worth joining" subtitle="Activity details" onBack={() => navigation.goBack()} />
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <Tag label={activity.category.toUpperCase()} />
          <Text style={styles.sparkle}>✳</Text>
        </View>
        <Text style={styles.title}>{activity.venue}</Text>
        <Text style={styles.date}>{activity.date} · {activity.time}</Text>
        <View style={styles.divider} />
        <View style={styles.hostRow}>
          <Avatar initials={activity.initials} size={44} tone="peach" />
          <View>
            <Text style={styles.hostName}>{activity.host}</Text>
            <Text style={styles.hostSubtitle}>İTÜ member · campus regular</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>THE PLAN</Text>
      <Text style={styles.note}>{activity.note || "A relaxed campus hangout. Come as you are."}</Text>

      <View style={styles.messageHeader}>
        <Text style={styles.sectionLabel}>SAY HELLO</Text>
        <Text style={styles.optional}>This starts your activity chat</Text>
      </View>
      <Card style={styles.messageCard}>
        <Text style={styles.messageLabel}>Your join request message</Text>
        <Field
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Say hello…"
          multiline
        />
      </Card>

      <View style={styles.actions}>
        <Button label="Send join request" icon="↗" onPress={request} />
        <Button
          label="Report this plan"
          variant="quiet"
          onPress={() => navigation.navigate("Report", { activityId: activity.id })}
        />
      </View>
      <Text style={styles.footnote}>No GPS or maps. You’ll agree on an exact meeting point in chat.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radii.lg, padding: spacing.xl },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sparkle: { color: colors.primary, fontSize: 24 },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800", marginTop: spacing.xl },
  date: { color: colors.primary, fontSize: typography.label, fontWeight: "600", marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.lg },
  hostRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  hostName: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  hostSubtitle: { color: colors.muted, fontSize: typography.caption, marginTop: spacing.xs },
  sectionLabel: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.3, marginTop: spacing.xl },
  note: { color: colors.ink, fontSize: typography.body, lineHeight: 23, marginTop: spacing.sm },
  messageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optional: { color: colors.muted, fontSize: 10, marginTop: spacing.xl },
  messageCard: { marginTop: spacing.md },
  messageLabel: { color: colors.muted, fontSize: typography.caption },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  footnote: { color: colors.muted, fontSize: typography.caption, textAlign: "center", lineHeight: 17, marginTop: spacing.md },
});
