import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Chip, Field, Page, PageHeader, SectionTitle } from "../components/DesignSystem";
import type { ActivityCategory } from "../prototype/PrototypeData";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Period = "Morning" | "Afternoon" | "Evening";
const activityCategories: ActivityCategory[] = ["Library", "Gym", "Cafeteria"];
const venueSuggestions: Record<ActivityCategory, string[]> = {
  Library: ["Mustafa İnan Library", "Central Library"],
  Gym: ["Ayazağa Campus Gym", "Indoor Sports Hall"],
  Cafeteria: ["Central Cafeteria", "Faculty Cafeteria"],
};

export default function CreateActivityScreen() {
  const navigation = useNavigation<Navigation>();
  const { addActivity } = usePrototypeData();
  const [category, setCategory] = useState<ActivityCategory>("Library");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("Tomorrow");
  const [time, setTime] = useState("17:00–18:00");
  const [note, setNote] = useState("");

  const save = () => {
    if (!venue.trim() || !date.trim() || !time.trim()) {
      Alert.alert("A little more detail", "Add a venue, date, and time window to publish your plan.");
      return;
    }
    const hour = Number(time.slice(0, 2));
    const period: Period = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    addActivity({ category, venue: venue.trim(), date: date.trim(), time: time.trim(), period, note: note.trim() });
    navigation.navigate("Home");
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Make a little plan" subtitle="A place, a time, and an open invite" onBack={() => navigation.goBack()} />
      <Text style={styles.step}>01  /  YOUR ACTIVITY</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {activityCategories.map((item) => (
          <Chip key={item} label={item} selected={category === item} onPress={() => { setCategory(item); setVenue(""); }} />
        ))}
      </ScrollView>

      <SectionTitle title="Where should people meet?" />
      <Text style={styles.helper}>Choose a campus spot, or enter another from the venue list.</Text>
      <View style={styles.venueChips}>
        {venueSuggestions[category].map((item) => (
          <Chip key={item} label={item} selected={venue === item} onPress={() => setVenue(item)} />
        ))}
      </View>
      <Field label="Campus venue" value={venue} onChangeText={setVenue} placeholder="e.g. Mustafa İnan Library" />
      <Field label="Planned date" value={date} onChangeText={setDate} placeholder="e.g. 20 November" />
      <Field label="Time window" value={time} onChangeText={setTime} placeholder="e.g. 17:00–18:00" />
      <Field label="A note for your campus buddy" value={note} onChangeText={setNote} placeholder="What are you planning to do? (optional)" multiline />

      <Card style={styles.preview}>
        <View style={styles.previewTop}>
          <Text style={styles.previewLabel}>YOUR INVITE PREVIEW</Text>
          <Text style={styles.sparkle}>✳</Text>
        </View>
        <Text style={styles.previewTitle}>{category} · {venue || "Choose a venue"}</Text>
        <Text style={styles.previewTime}>{date || "Choose a day"} · {time || "Add a time"}</Text>
        {note ? <Text style={styles.previewNote}>{note}</Text> : null}
      </Card>
      <View style={styles.gpsNote}><Text style={styles.gpsIcon}>◎</Text><Text style={styles.gpsText}>Campus venues only. We never use your GPS location.</Text></View>
      <Button label="Publish activity" icon="↗" onPress={save} />
      <Text style={styles.footer}>You can edit or remove your post from Home.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  step: { color: colors.primary, fontSize: typography.caption, fontWeight: "800", letterSpacing: 1.4, marginBottom: spacing.md },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  helper: { color: colors.muted, fontSize: typography.label, marginTop: -spacing.sm, marginBottom: spacing.md, lineHeight: 20 },
  venueChips: { gap: spacing.sm, marginBottom: spacing.lg },
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
