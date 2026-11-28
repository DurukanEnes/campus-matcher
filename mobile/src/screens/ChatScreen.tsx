import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useChat } from "../chat/ChatContext";
import { chatState, firstMessage, formatClock, validateMessage } from "../chat/chatRules";
import { Avatar, Button, Page, PageHeader, Tag } from "../components/DesignSystem";
import { usePrototypeData, type RequestStatus } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type ChatRoute = RouteProp<RootStackParamList, "Chat">;

const statusTags: Record<RequestStatus, string> = {
  pending: "PENDING",
  accepted: "MATCHED",
  declined: "DECLINED",
};

export default function ChatScreen({ now = () => new Date() }: { now?: () => Date }) {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<ChatRoute>();
  const { activities, requests } = usePrototypeData();
  const { sentMessages, addMessage } = useChat();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();

  const request = requests.find((item) => item.id === params.requestId);
  const activity = activities.find((item) => item.id === request?.activityId);
  const state = chatState(request, activity);

  if (!request || !activity || state === "ended") {
    return (
      <Page showTabs={false} scrollable={false}>
        <PageHeader title="Activity chat" onBack={() => navigation.goBack()} />
        <View style={styles.ended}>
          <Text style={styles.endedGlyph}>☾</Text>
          <Text style={styles.endedTitle}>This activity has ended</Text>
          <Text style={styles.endedCopy}>Activities, requests, and chats are deleted at 23:59 on the planned day.</Text>
          <Button label="Back to Home" variant="secondary" onPress={() => navigation.navigate("Home")} />
        </View>
      </Page>
    );
  }

  const iAmOwner = request.direction === "incoming";
  const otherName = iAmOwner ? request.requester : activity.host;
  const otherInitials = iAmOwner ? request.initials : activity.initials;
  const messages = [firstMessage(request), ...sentMessages(request.id)];
  const canSend = draft.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    const problem = validateMessage(draft);
    setError(problem);
    if (problem) return;
    addMessage(request.id, draft.trim(), formatClock(now()));
    setDraft("");
  };

  return (
    <Page showTabs={false} scrollable={false} avoidKeyboard>
      <PageHeader title={otherName} subtitle={`${activity.category} · ${activity.venue}`} onBack={() => navigation.goBack()} />
      <View style={styles.activityBanner}>
        <Text style={styles.activityGlyph}>✳</Text>
        <View style={styles.activityText}>
          <Text style={styles.activityTitle}>{activity.date} · {activity.time}</Text>
          <Text style={styles.activitySubtitle}>{activity.venue}</Text>
        </View>
        <Tag label={statusTags[request.status]} />
      </View>
      <View style={styles.chatNotice}>
        <Text style={styles.noticeGlyph}>◎</Text>
        <Text style={styles.noticeText}>Agree on an exact meeting point here. No location sharing.</Text>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messageList} showsVerticalScrollIndicator={false}>
        <Text style={styles.dayDivider}>{activity.date.toUpperCase()}</Text>
        {messages.map((message) => (
          <View
            key={message.id}
            accessible
            accessibilityLabel={`${message.mine ? "You" : otherName}: ${message.text}`}
            style={[styles.messageRow, message.mine ? styles.mineRow : null]}
          >
            {!message.mine ? <Avatar initials={otherInitials} size={30} tone="lavender" /> : null}
            <View style={[styles.bubble, message.mine ? styles.mineBubble : styles.theirBubble]}>
              <Text style={[styles.messageText, message.mine ? styles.mineText : null]}>{message.text}</Text>
              <Text style={[styles.messageTime, message.mine ? styles.mineTime : null]}>{message.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      {state === "read-only" ? (
        <View style={styles.readOnly}>
          <Text style={styles.readOnlyText}>This request was declined. The chat is read-only.</Text>
        </View>
      ) : (
        <>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Chat message"
              onChangeText={(value) => {
                setDraft(value);
                setError(undefined);
              }}
              onSubmitEditing={send}
              placeholder="Write a message…"
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              onPress={send}
              style={[styles.sendButton, canSend ? null : styles.sendDisabled]}
            >
              <Text style={styles.sendGlyph}>↑</Text>
            </Pressable>
          </View>
        </>
      )}
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
  messages: { flex: 1, marginTop: spacing.md },
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
  error: { color: colors.danger, fontSize: typography.caption, marginBottom: spacing.sm },
  composer: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, paddingLeft: spacing.lg, borderWidth: 1, borderColor: colors.line, borderRadius: radii.pill, backgroundColor: colors.surface },
  input: { flex: 1, color: colors.ink, fontSize: typography.label, paddingVertical: spacing.sm },
  sendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  sendDisabled: { opacity: 0.4 },
  sendGlyph: { color: colors.surface, fontSize: 20, fontWeight: "700", marginTop: -2 },
  expiry: { color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: "center", paddingTop: spacing.md },
  readOnly: { padding: spacing.lg, borderRadius: radii.md, backgroundColor: colors.dangerSoft },
  readOnlyText: { color: colors.danger, fontSize: typography.label, textAlign: "center" },
  ended: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, paddingHorizontal: spacing.xl },
  endedGlyph: { color: colors.primary, fontSize: 46 },
  endedTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "800", textAlign: "center" },
  endedCopy: { color: colors.muted, fontSize: typography.label, lineHeight: 20, textAlign: "center", marginBottom: spacing.md },
});
