import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ActivityCard from "../components/ActivityCard";
import { Avatar, BrandMark, Button, Page, SectionTitle, Tag } from "../components/DesignSystem";
import { usePrototypeData } from "../prototype/PrototypeData";
import { colors, radii, spacing, typography } from "../theme/tokens";
import type { RootStackParamList } from "../navigation/types";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function todayLabel(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export default function HomeScreen({ now = () => new Date() }: { now?: () => Date }) {
  const navigation = useNavigation<Navigation>();
  const { activities, requests } = usePrototypeData();
  const myActivities = activities.filter((activity) => activity.host === "You");
  const pendingRequests = requests.filter(
    (request) => request.direction === "incoming" && request.status === "pending",
  ).length;

  return (
    <Page
      activeTab="Home"
      onTabSelect={(tab) => navigation.navigate(tab)}
    >
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <BrandMark />
          <View>
            <Text style={styles.brandName}>CampusMatcher</Text>
            <Text style={styles.brandSub}>İTÜ · together on campus</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => navigation.navigate("Profile")}
        >
          <Avatar initials="EO" size={42} />
        </Pressable>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.overline}>{todayLabel(now())}</Text>
        <Text style={styles.headline}>Make today a little{`\n`}less solo.</Text>
        <Text style={styles.intro}>
          Find your people for the small campus moments.
        </Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroDecoration} />
        <Text style={styles.heroEyebrow}>YOUR CAMPUS, YOUR RHYTHM</Text>
        <Text style={styles.heroTitle}>Good things happen{`\n`}when we show up.</Text>
        <Text style={styles.heroCopy}>
          Study, move, or grab a bite with someone going your way.
        </Text>
        <View style={styles.heroActions}>
          <Button
            label="Join Activity"
            icon="↗"
            variant="secondary"
            onPress={() => navigation.navigate("ActivityFeed")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add Activity"
            onPress={() => navigation.navigate("CreateActivity")}
            style={styles.addButton}
          >
            <Text style={styles.addGlyph}>＋</Text>
          </Pressable>
        </View>
        <View style={styles.heroStamp}>
          <Text style={styles.stampText}>BE{`\n`}THERE</Text>
        </View>
      </View>

      <SectionTitle
        title="Your next little plan"
        action={
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("CreateActivity")}
          >
            <Text style={styles.textLink}>＋ Add one</Text>
          </Pressable>
        }
      />
      {myActivities.length ? (
        myActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => navigation.navigate("ActivityDetail", { activityId: activity.id })}
          />
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Your calendar is open.</Text>
          <Text style={styles.emptyCopy}>Post a plan and invite someone to join.</Text>
          <Button
            label="Add activity"
            onPress={() => navigation.navigate("CreateActivity")}
            icon="＋"
          />
        </View>
      )}

      <SectionTitle
        title="A little heads-up"
        action={
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Requests")}
          >
            <Text style={styles.textLink}>See all</Text>
          </Pressable>
        }
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Requests")}
        style={styles.requestCard}
      >
        <View style={styles.requestIcon}><Text style={styles.requestGlyph}>♡</Text></View>
        <View style={styles.requestText}>
          <Text style={styles.requestTitle}>Someone wants to join</Text>
          <Text style={styles.requestCopy}>
            {pendingRequests
              ? `${pendingRequests} ${pendingRequests === 1 ? "request" : "requests"} waiting for you`
              : "You’re all caught up for now"}
          </Text>
        </View>
        {pendingRequests ? <Tag label={`${pendingRequests} NEW`} /> : <Text style={styles.chevron}>›</Text>}
      </Pressable>

      <View style={styles.demoNote}>
        <Text style={styles.demoNoteText}>
          Prototype preview · Sample activities and profile data
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: spacing.sm },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  brandName: { color: colors.ink, fontSize: typography.body, fontWeight: "800" },
  brandSub: { color: colors.muted, fontSize: typography.caption, marginTop: 2 },
  greeting: { marginTop: spacing.xxl, marginBottom: spacing.xl },
  overline: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.5 },
  headline: { color: colors.ink, fontSize: typography.display, lineHeight: 39, fontWeight: "800", letterSpacing: -1.2, marginTop: spacing.md },
  intro: { color: colors.muted, fontSize: typography.body, lineHeight: 22, marginTop: spacing.md },
  hero: { minHeight: 235, borderRadius: radii.lg, padding: spacing.xl, overflow: "hidden", backgroundColor: colors.primary },
  heroDecoration: { position: "absolute", width: 178, height: 178, right: -54, top: -62, borderRadius: 90, backgroundColor: "#2A815E" },
  heroEyebrow: { color: colors.lime, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.5 },
  heroTitle: { color: colors.surface, fontSize: 24, lineHeight: 29, fontWeight: "800", letterSpacing: -0.5, marginTop: spacing.md },
  heroCopy: { maxWidth: 235, color: "#D8E9DF", fontSize: typography.label, lineHeight: 19, marginTop: spacing.sm },
  heroActions: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.lg },
  addButton: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.lime },
  addGlyph: { color: colors.primaryDark, fontSize: 26, lineHeight: 30, fontWeight: "500" },
  heroStamp: { position: "absolute", right: 24, bottom: 34, width: 61, height: 61, borderWidth: 1, borderColor: "#74A78B", borderRadius: 31, alignItems: "center", justifyContent: "center", transform: [{ rotate: "12deg" }] },
  stampText: { color: colors.lime, fontSize: 10, lineHeight: 11, letterSpacing: 1, fontWeight: "800", textAlign: "center" },
  textLink: { color: colors.primary, fontSize: typography.label, fontWeight: "700" },
  emptyCard: { gap: spacing.md, borderRadius: radii.lg, padding: spacing.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "700" },
  emptyCopy: { color: colors.muted, fontSize: typography.label, lineHeight: 20 },
  requestCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: spacing.lg },
  requestIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.peach },
  requestGlyph: { color: colors.ink, fontSize: 21 },
  requestText: { flex: 1 },
  requestTitle: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  requestCopy: { color: colors.muted, fontSize: typography.caption, marginTop: 4 },
  chevron: { color: colors.muted, fontSize: 25 },
  demoNote: { alignItems: "center", paddingVertical: spacing.xl },
  demoNoteText: { color: colors.muted, fontSize: typography.caption },
});
