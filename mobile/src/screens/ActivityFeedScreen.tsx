import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ActivityCard from "../components/ActivityCard";
import { Chip, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import { CURRENT_MEMBER_ID, getHiddenMemberIds, usePrototypeData } from "../prototype/PrototypeData";
import type { Activity, ActivityCategory } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
export type CategoryFilter = "All" | ActivityCategory;
export type HourFilter = "Any time" | "Before 12:00" | "12:00–15:00" | "15:00–18:00" | "After 18:00";
export type FeedFilters = { category: CategoryFilter; hour: HourFilter; venue: string };

const categories: CategoryFilter[] = ["All", "Library", "Gym", "Cafeteria"];
const hourFilters: HourFilter[] = ["Any time", "Before 12:00", "12:00–15:00", "15:00–18:00", "After 18:00"];
const hourRanges: Record<Exclude<HourFilter, "Any time">, [number, number]> = {
  "Before 12:00": [0, 12],
  "12:00–15:00": [12, 15],
  "15:00–18:00": [15, 18],
  "After 18:00": [18, 24],
};
const defaultFilters: FeedFilters = { category: "All", hour: "Any time", venue: "" };

/** Start hour of a "HH:MM–HH:MM" time window. */
export function startHour(time: string): number {
  return Number(time.split("–")[0]?.split(":")[0]);
}

/**
 * Feed rules from FR-10 to FR-12: only other members' open posts, filtered by category,
 * start hour, and venue; the filters can be combined. Order is kept (newest first).
 * Posts of blocked (FR-20) and suspended (FR-23) members are never shown.
 */
export function filterFeed(
  activities: Activity[],
  filters: FeedFilters,
  hiddenHostIds: ReadonlySet<string> = new Set(),
): Activity[] {
  const venue = filters.venue.trim().toLowerCase();
  return activities.filter((activity) => {
    if (activity.status !== "open" || activity.hostId === CURRENT_MEMBER_ID) return false;
    if (hiddenHostIds.has(activity.hostId)) return false;
    if (filters.category !== "All" && activity.category !== filters.category) return false;
    if (filters.hour !== "Any time") {
      const [from, to] = hourRanges[filters.hour];
      const hour = startHour(activity.time);
      if (!(hour >= from && hour < to)) return false;
    }
    return activity.venue.toLowerCase().includes(venue);
  });
}

export default function ActivityFeedScreen() {
  const navigation = useNavigation<Navigation>();
  const { activities, members, blockedIds } = usePrototypeData();
  const [filters, setFilters] = useState<FeedFilters>(defaultFilters);
  const update = (patch: Partial<FeedFilters>) => setFilters((current) => ({ ...current, ...patch }));
  const visibleActivities = useMemo(
    () => filterFeed(activities, filters, getHiddenMemberIds(members, blockedIds)),
    [activities, blockedIds, filters, members],
  );
  const hasFilters = filters.category !== "All" || filters.hour !== "Any time" || filters.venue.trim() !== "";

  return (
    <Page activeTab="ActivityFeed" onTabSelect={(tab) => navigation.navigate(tab)}>
      <PageHeader title="Find your people" subtitle="Open plans around campus" />
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search campus venues"
          onChangeText={(venue) => update({ venue })}
          placeholder="Search a campus venue"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={filters.venue}
        />
      </View>

      <SectionTitle title="What are you in the mood for?" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((item) => (
          <Chip key={item} label={item} selected={filters.category === item} onPress={() => update({ category: item })} />
        ))}
      </ScrollView>

      <SectionTitle title="Start time" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {hourFilters.map((item) => (
          <Chip key={item} label={item} selected={filters.hour === item} onPress={() => update({ hour: item })} />
        ))}
      </ScrollView>

      <SectionTitle
        title="Open activities"
        action={
          <View style={styles.resultMeta}>
            <Text style={styles.count}>{visibleActivities.length} {visibleActivities.length === 1 ? "plan" : "plans"}</Text>
            {hasFilters && visibleActivities.length > 0 ? (
              <Text accessibilityRole="button" style={styles.clear} onPress={() => setFilters(defaultFilters)}>Clear</Text>
            ) : null}
          </View>
        }
      />
      {visibleActivities.length ? visibleActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onPress={() => navigation.navigate("ActivityDetail", { activityId: activity.id })}
        />
      )) : (
        <View style={styles.empty}>
          <Text style={styles.emptyGlyph}>⌕</Text>
          <Text style={styles.emptyTitle}>No plans match just yet.</Text>
          <Text style={styles.emptyCopy}>Try another category, time, or campus venue.</Text>
          <Text accessibilityRole="button" style={styles.reset} onPress={() => setFilters(defaultFilters)}>
            Clear filters
          </Text>
        </View>
      )}
      <Text style={styles.privacyNote}>Campus venues only · No location tracking</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  searchIcon: { color: colors.primary, fontSize: 23 },
  searchInput: { flex: 1, color: colors.ink, fontSize: typography.label, paddingVertical: spacing.md },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  count: { color: colors.muted, fontSize: typography.caption },
  resultMeta: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  clear: { color: colors.primary, fontSize: typography.caption, fontWeight: "700" },
  empty: { alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  emptyGlyph: { color: colors.primary, fontSize: 32, marginBottom: spacing.md },
  emptyTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "700" },
  emptyCopy: { color: colors.muted, fontSize: typography.label, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
  reset: { color: colors.primary, fontSize: typography.label, fontWeight: "700", marginTop: spacing.lg },
  privacyNote: { color: colors.muted, fontSize: typography.caption, textAlign: "center", paddingVertical: spacing.xl },
});
