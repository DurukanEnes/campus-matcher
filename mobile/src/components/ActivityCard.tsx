import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Activity } from "../prototype/PrototypeData";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { Avatar, Tag } from "./DesignSystem";

const categoryTone = {
  Library: "green",
  Gym: "peach",
  Cafeteria: "lavender",
} as const;

const categoryGlyph = {
  Library: "▤",
  Gym: "↗",
  Cafeteria: "✳",
} as const;

export default function ActivityCard({
  activity,
  onPress,
}: {
  activity: Activity;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${activity.category} at ${activity.venue}, ${activity.date} ${activity.time}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.topRow}>
        <View style={[styles.glyphWrap, glyphBackground[activity.category]]}>
          <Text style={styles.glyph}>{categoryGlyph[activity.category]}</Text>
        </View>
        <View style={styles.topText}>
          <Text style={styles.category}>{activity.category}</Text>
          <Text style={styles.venue}>{activity.venue}</Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </View>
      <Text style={styles.note} numberOfLines={2}>{activity.note}</Text>
      <View style={styles.bottomRow}>
        <View style={styles.meta}>
          <Text style={styles.metaGlyph}>◷</Text>
          <Text style={styles.metaText}>{activity.date} · {activity.time}</Text>
        </View>
        <View style={styles.host}>
          <Avatar initials={activity.initials} size={28} tone={categoryTone[activity.category]} />
          <Text style={styles.hostName}>{activity.host}</Text>
        </View>
      </View>
      {activity.status === "matched" ? (
        <View style={styles.matchedTag}><Tag label="MATCHED" tone="peach" /></View>
      ) : null}
    </Pressable>
  );
}

const glyphBackground = StyleSheet.create({
  Library: { backgroundColor: colors.primarySoft },
  Gym: { backgroundColor: colors.peach },
  Cafeteria: { backgroundColor: colors.lavender },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.82 },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  glyphWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  glyph: { color: colors.ink, fontSize: 22, fontWeight: "700" },
  topText: { flex: 1, gap: 3 },
  category: { color: colors.ink, fontSize: typography.body, fontWeight: "700" },
  venue: { color: colors.muted, fontSize: typography.label },
  arrow: { color: colors.muted, fontSize: 26 },
  note: { color: colors.ink, fontSize: typography.label, lineHeight: 20, marginTop: spacing.md },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: spacing.sm,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs, flexShrink: 1 },
  metaGlyph: { color: colors.primary, fontSize: 15 },
  metaText: { color: colors.muted, fontSize: typography.caption, flexShrink: 1 },
  host: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  hostName: { color: colors.ink, fontSize: typography.caption, fontWeight: "600" },
  matchedTag: { position: "absolute", right: spacing.lg, top: spacing.xxl + spacing.md },
});
