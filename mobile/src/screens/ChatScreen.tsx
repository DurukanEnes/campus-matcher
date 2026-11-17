import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar, Page, PageHeader, Tag } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ChatRoute = RouteProp<RootStackParamList, "Chat">;
type Message = { id: string; text: string; mine: boolean; time: string };

export default function ChatScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ChatRoute>();
  const { activities, requests } = usePrototypeData();
  const activity = activities.find((item) => item.id === route.params.activityId) ?? activities[0];
  const request = requests.find((item) => item.activityId === route.params.activityId);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: request?.message ?? "Hi! Looking forward to meeting up.", mine: !request || request.direction === "outgoing", time: "16:12" },
    { id: "reply", text: "Sounds good! Shall we meet by the main entrance?", mine: request?.direction === "incoming", time: "16:14" },
  ]);

  const send = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }
    setMessages((current) => [...current, { id: `${Date.now()}`, text, mine: true, time: "Now" }]);
    setDraft("");
  };

  return (
    <Page showTabs={false} scrollable={false}>
      <PageHeader
        title={request?.requester ?? activity?.host ?? "Activity chat"}
        subtitle={`${activity?.category ?? "Activity"} · ${activity?.venue ?? "Campus"}`}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.activityBanner}>
        <Text style={styles.activityGlyph}>✳</Text>
        <View style={styles.activityText}>
          <Text style={styles.activityTitle}>{activity?.date ?? "Today"} · {activity?.time ?? "Time to confirm"}</Text>
          <Text style={styles.activitySubtitle}>{activity?.venue ?? "Campus venue"}</Text>
        </View>
        <Tag label={activity?.status === "matched" ? "MATCHED" : "PENDING"} />
      </View>
      <View style={styles.chatNotice}>
        <Text style={styles.noticeGlyph}>◎</Text>
        <Text style={styles.noticeText}>Agree on an exact meeting point here. No location sharing.</Text>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false}>
        <Text style={styles.dayDivider}>TODAY</Text>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.mine ? styles.mineRow : null]}>
            {!message.mine ? <Avatar initials={activity?.initials ?? "CM"} size={30} tone="lavender" /> : null}
            <View style={[styles.bubble, message.mine ? styles.mineBubble : styles.theirBubble]}>
              <Text style={[styles.messageText, message.mine ? styles.mineText : null]}>{message.text}</Text>
              <Text style={[styles.messageTime, message.mine ? styles.mineTime : null]}>{message.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Chat message"
          onChangeText={setDraft}
          onSubmitEditing={send}
          placeholder="Write a message…"
          placeholderTextColor={colors.muted}
          returnKeyType="send"
          style={styles.input}
          value={draft}
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} style={styles.sendButton}>
          <Text style={styles.sendGlyph}>↑</Text>
        </Pressable>
      </View>
      <Text style={styles.expiry}>Activity, requests, and chat are cleared at 23:59 on the planned day.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  activityBanner: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.primarySoft },
  activityGlyph: { color: colors.primary, fontSize: 22 },
  activityText: { flex: 1 },
  activityTitle: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  activitySubtitle: { color: colors.muted, fontSize: typography.caption, marginTop: 3 },
  chatNotice: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.line },
  noticeGlyph: { color: colors.primary, fontSize: 18 },
  noticeText: { flex: 1, color: colors.muted, fontSize: typography.caption },
  messages: { flex: 1, minHeight: 260, maxHeight: 420, marginTop: spacing.md },
  messageList: { gap: spacing.md, paddingVertical: spacing.md },
  dayDivider: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.4, textAlign: "center", marginBottom: spacing.sm },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, maxWidth: "88%" },
  mineRow: { alignSelf: "flex-end" },
  bubble: { borderRadius: 18, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  mineBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 5 },
  theirBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.line },
  messageText: { color: colors.ink, fontSize: typography.label, lineHeight: 20 },
  mineText: { color: colors.surface },
  messageTime: { color: colors.muted, fontSize: 9, textAlign: "right", marginTop: spacing.xs },
  mineTime: { color: "#D8E9DF" },
  composer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, paddingLeft: spacing.lg, borderWidth: 1, borderColor: colors.line, borderRadius: radii.pill, backgroundColor: colors.surface },
  input: { flex: 1, color: colors.ink, fontSize: typography.label, paddingVertical: spacing.sm },
  sendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  sendGlyph: { color: colors.surface, fontSize: 20, fontWeight: "700", marginTop: -2 },
  expiry: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", paddingTop: spacing.md },
});
