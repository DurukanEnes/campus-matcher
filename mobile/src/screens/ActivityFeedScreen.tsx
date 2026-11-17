import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ActivityCard from "../components/ActivityCard";
import { Chip, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { ActivityCategory } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type CategoryFilter = "All" | ActivityCategory;
type TimeFilter = "Any time" | "12–15" | "15–18" | "18–21";

const categories: CategoryFilter[] = ["All", "Library", "Gym", "Cafeteria"];
const timeRanges: TimeFilter[] = ["Any time", "12–15", "15–18", "18–21"];

export default function ActivityFeedScreen() {
  const navigation = useNavigation<Navigation>();
  const { activities } = usePrototypeData();
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [timeRange, setTimeRange] = useState<TimeFilter>("Any time");
  const [venueQuery, setVenueQuery] = useState("");

  const visibleActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesCategory = category === "All" || activity.category === category;
        const startHour = Number(activity.time.split("–")[0]?.split(":")[0]);
        const matchesTime = timeRange === "Any time" ||
          (timeRange === "12–15" && startHour >= 12 && startHour < 15) ||
          (timeRange === "15–18" && startHour >= 15 && startHour < 18) ||
          (timeRange === "18–21" && startHour >= 18 && startHour < 21);
        const matchesVenue = activity.venue.toLowerCase().includes(venueQuery.trim().toLowerCase());
        return activity.status === "open" && activity.host !== "You" &&
          matchesCategory && matchesTime && matchesVenue;
      }),
    [activities, category, timeRange, venueQuery],
  );

  return (
    <Page activeTab="ActivityFeed" onTabSelect={(tab) => navigation.navigate(tab)}>
      <PageHeader title="Find your people" subtitle="Open plans around campus" />
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          accessibilityLabel="Search campus venues"
          onChangeText={setVenueQuery}
          placeholder="Search a campus venue"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={venueQuery}
        />
      </View>

      <SectionTitle title="What are you in the mood for?" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {categories.map((item) => (
          <Chip key={item} label={item} selected={category === item} onPress={() => setCategory(item)} />
        ))}
      </ScrollView>

      <SectionTitle title="Start time" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {timeRanges.map((item) => (
          <Chip key={item} label={item} selected={timeRange === item} onPress={() => setTimeRange(item)} />
        ))}
      </ScrollView>

      <SectionTitle title="Open activities" action={<Text style={styles.count}>{visibleActivities.length} plans</Text>} />
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
          <Text style={styles.reset} onPress={() => { setCategory("All"); setTimeRange("Any time"); setVenueQuery(""); }}>
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
  empty: { alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xxxl, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  emptyGlyph: { color: colors.primary, fontSize: 32, marginBottom: spacing.md },
  emptyTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "700" },
  emptyCopy: { color: colors.muted, fontSize: typography.label, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
  reset: { color: colors.primary, fontSize: typography.label, fontWeight: "700", marginTop: spacing.lg },
  privacyNote: { color: colors.muted, fontSize: typography.caption, textAlign: "center", paddingVertical: spacing.xl },
});
