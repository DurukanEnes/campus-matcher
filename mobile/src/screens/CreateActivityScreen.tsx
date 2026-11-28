import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  dateLabel,
  formatTime,
  parseTime,
  periodOf,
  upcomingDates,
  validatePost,
  VENUES,
  type PostErrors,
} from "../activities/postRules";
import { Button, Card, Chip, Field, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import type { ActivityCategory } from "../prototype/PrototypeData";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const activityCategories: ActivityCategory[] = ["Library", "Gym", "Cafeteria"];

function displayTime(value: string): string {
  const minutes = parseTime(value);
  return minutes === undefined ? value.trim() : formatTime(minutes);
}

export default function CreateActivityScreen({ now = () => new Date() }: { now?: () => Date }) {
  const navigation = useNavigation<Navigation>();
  const { addActivity } = usePrototypeData();
  const [today] = useState(now);
  const [dates] = useState(() => upcomingDates(today));
  const [category, setCategory] = useState<ActivityCategory>("Library");
  const [venue, setVenue] = useState<string | null>(null);
  const [date, setDate] = useState(dates[0].iso);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<PostErrors>({});

  const chooseCategory = (item: ActivityCategory) => {
    setCategory(item);
    setVenue(null);
  };

  const publish = () => {
    const draft = { category, venue, date, start, end };
    const found = validatePost(draft, now());
    setErrors(found);
    if (Object.keys(found).length > 0 || !venue) return;

    const startMinutes = parseTime(start)!;
    addActivity({
      category,
      venue,
      date: dateLabel(date, now()),
      time: `${formatTime(startMinutes)}–${displayTime(end)}`,
      period: periodOf(startMinutes),
      note: note.trim(),
    });
    navigation.navigate("Home");
  };

  const timePreview = start || end ? `${displayTime(start) || "--:--"}–${displayTime(end) || "--:--"}` : "Add a time";

  return (
    <Page showTabs={false}>
      <PageHeader title="Make a little plan" subtitle="A place, a time, and an open invite" onBack={() => navigation.goBack()} />
      <Text style={styles.step}>01  /  YOUR ACTIVITY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {activityCategories.map((item) => (
          <Chip key={item} label={item} selected={category === item} onPress={() => chooseCategory(item)} />
        ))}
      </ScrollView>

      <SectionTitle title="Where should people meet?" />
      <Text style={styles.helper}>Choose a spot from the İTÜ campus venue list.</Text>
      <View style={styles.venueChips}>
        {VENUES[category].map((item) => (
          <Chip key={item} label={item} selected={venue === item} onPress={() => setVenue(item)} />
        ))}
      </View>
      {errors.venue ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {errors.venue}
        </Text>
      ) : null}

      <SectionTitle title="When?" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {dates.map((item) => (
          <Chip key={item.iso} label={item.label} selected={date === item.iso} onPress={() => setDate(item.iso)} />
        ))}
      </ScrollView>
      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <Field label="Start time" value={start} onChangeText={setStart} placeholder="19:00" error={errors.start} />
        </View>
        <View style={styles.timeField}>
          <Field label="End time" value={end} onChangeText={setEnd} placeholder="23:00" error={errors.end} />
        </View>
      </View>
      <Text style={styles.helper}>Use the 24-hour format. An activity ends by 23:59 of its day.</Text>
      <Field label="A note for your campus buddy" value={note} onChangeText={setNote} placeholder="What are you planning to do? (optional)" multiline />

      <Card style={styles.preview}>
        <View style={styles.previewTop}>
          <Text style={styles.previewLabel}>YOUR INVITE PREVIEW</Text>
          <Text style={styles.sparkle}>✳</Text>
        </View>
        <Text style={styles.previewTitle}>{category} · {venue ?? "Choose a venue"}</Text>
        <Text style={styles.previewTime}>{dateLabel(date, today)} · {timePreview}</Text>
        {note ? <Text style={styles.previewNote}>{note}</Text> : null}
      </Card>
      <View style={styles.gpsNote}><Text style={styles.gpsIcon}>◎</Text><Text style={styles.gpsText}>Campus venues only. We never use your GPS location.</Text></View>
      <Button label="Publish activity" icon="↗" onPress={publish} />
      <Text style={styles.footer}>You can edit or remove your post from Home.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  step: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.4, marginBottom: spacing.md },
  chips: { gap: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.lg },
  helper: { color: colors.muted, fontSize: typography.label, marginTop: -spacing.sm, marginBottom: spacing.md, lineHeight: 20 },
  venueChips: { gap: spacing.sm, marginBottom: spacing.lg },
  error: { color: colors.danger, fontSize: typography.caption, marginTop: -spacing.sm, marginBottom: spacing.lg },
  timeRow: { flexDirection: "row", gap: spacing.md },
  timeField: { flex: 1 },
  preview: { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft, marginBottom: spacing.lg },
  previewTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewLabel: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.2 },
  sparkle: { color: colors.primary, fontSize: 21 },
  previewTitle: { color: colors.ink, fontSize: typography.body, fontWeight: "700", marginTop: spacing.md },
  previewTime: { color: colors.muted, fontSize: typography.label, marginTop: spacing.xs },
  previewNote: { color: colors.ink, fontSize: typography.label, marginTop: spacing.md, lineHeight: 20 },
  gpsNote: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  gpsIcon: { color: colors.primary, fontSize: 18 },
  gpsText: { flex: 1, color: colors.muted, fontSize: typography.caption },
  footer: { color: colors.muted, textAlign: "center", fontSize: typography.caption, paddingVertical: spacing.lg },
});
