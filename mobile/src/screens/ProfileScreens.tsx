import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card, Chip, Page, PageHeader, SectionTitle, Tag, Field } from "../components/DesignSystem";
import type { RootStackParamList } from "../navigation/types";
import { usePrototypeData } from "../prototype/PrototypeData";
import type { ActivityCategory } from "../prototype/PrototypeData";
import { colors, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const activityOptions: ActivityCategory[] = ["Library", "Gym", "Cafeteria"];

export function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const { profile, role, setRole } = usePrototypeData();
  const interests = profile.interests.split(",").map((interest) => interest.trim()).filter(Boolean);
  return (
    <Page activeTab="Profile" onTabSelect={(tab) => navigation.navigate(tab)}>
      <PageHeader title="Your corner" subtitle="A little about you" />
      <Card style={styles.profileCard}>
        <Avatar initials={getInitials(profile.name)} size={68} />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.faculty}>{profile.department} · İTÜ member</Text>
        <Button label="Edit profile" variant="secondary" onPress={() => navigation.navigate("EditProfile")} />
      </Card>
      <SectionTitle title="Things you’re into" />
      <View style={styles.chips}>
        {interests.length > 0
          ? interests.map((interest) => <Tag key={interest} label={interest.toUpperCase()} />)
          : <Text style={styles.preferenceText}>No interests added</Text>}
      </View>
      <SectionTitle title="Your preferences" />
      <Card style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Activities I like</Text>
        <Text style={styles.preferenceText}>
          {profile.activityPreferences.length > 0
            ? profile.activityPreferences.join(" · ")
            : "No activities selected"}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.preferenceTitle}>Campus location</Text>
        <Text style={styles.preferenceText}>Ayazağa · chosen venues only</Text>
      </Card>
      <SectionTitle title="Safety & account" />
      <MenuRow label="Blocked accounts" detail="Manage who can contact you" icon="⊘" onPress={() => navigation.navigate("Safety")} />
      {role === "admin" ? (
        <MenuRow label="Review reports" detail="Administrator · moderation" icon="▤" onPress={() => navigation.navigate("AdminReports")} />
      ) : null}
      <SectionTitle title="Prototype role" />
      <View style={styles.chips}>
        <Chip label="Member" selected={role === "member"} onPress={() => setRole("member")} />
        <Chip label="Administrator" selected={role === "admin"} onPress={() => setRole("admin")} />
      </View>
      <Pressable onPress={() => Alert.alert("Demo account", "Sign-out is not connected in this prototype.")} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out of demo</Text>
      </Pressable>
      <Text style={styles.disclaimer}>Prototype profile · No personal data is saved</Text>
    </Page>
  );
}

export function EditProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const { profile, updateProfile } = usePrototypeData();
  const [name, setName] = useState(profile.name);
  const [department, setDepartment] = useState(profile.department);
  const [interest, setInterest] = useState(profile.interests);
  const [activityPreferences, setActivityPreferences] = useState(profile.activityPreferences);
  const cancelEdit = () => {
    setName(profile.name);
    setDepartment(profile.department);
    setInterest(profile.interests);
    setActivityPreferences(profile.activityPreferences);
    navigation.goBack();
  };
  const saveEdit = () => {
    updateProfile({
      name,
      department,
      interests: interest,
      activityPreferences: activityOptions.filter((option) => activityPreferences.includes(option)),
    });
    Alert.alert("Saved for preview", "Profile changes are temporary in this prototype.");
    navigation.goBack();
  };
  return (
    <Page showTabs={false}>
      <PageHeader title="Edit your profile" subtitle="Make your intro feel like you" onBack={cancelEdit} />
      <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field label="Faculty or department" value={department} onChangeText={setDepartment} placeholder="Your department" />
      <Field label="Interests" value={interest} onChangeText={setInterest} placeholder="Add a few interests" multiline />
      <SectionTitle title="Activity preferences" />
      <View style={styles.chips}>
        {activityOptions.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={activityPreferences.includes(option)}
            onPress={() =>
              setActivityPreferences((current) =>
                current.includes(option)
                  ? current.filter((preference) => preference !== option)
                  : [...current, option],
              )
            }
          />
        ))}
      </View>
      <View style={styles.saveButton}>
        <Button label="Save preview" onPress={saveEdit} />
      </View>
    </Page>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MenuRow({
  label,
  detail,
  icon,
  onPress,
  action,
  accessibilityLabel,
}: {
  label: string;
  detail: string;
  icon: string;
  onPress: () => void;
  action?: string;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={styles.menuRow}>
      <View style={styles.menuIcon}><Text style={styles.menuGlyph}>{icon}</Text></View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{label}</Text>
        <Text style={styles.menuDetail}>{detail}</Text>
      </View>
      <Text style={styles.menuAction}>{action ?? "›"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  name: { color: colors.ink, fontSize: typography.heading, fontWeight: "800", marginTop: spacing.sm },
  faculty: { color: colors.muted, fontSize: typography.label, marginBottom: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  preferenceCard: { gap: spacing.sm },
  preferenceTitle: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  preferenceText: { color: colors.muted, fontSize: typography.label, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.sm },
  menuRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  menuGlyph: { color: colors.primary, fontSize: 19 },
  menuText: { flex: 1 },
  menuTitle: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  menuDetail: { color: colors.muted, fontSize: typography.caption, marginTop: 3 },
  menuAction: { color: colors.primary, fontSize: typography.label, fontWeight: "700" },
  signOut: { alignItems: "center", paddingVertical: spacing.xl },
  signOutText: { color: colors.danger, fontSize: typography.label, fontWeight: "700" },
  disclaimer: { color: colors.muted, fontSize: typography.caption, textAlign: "center", lineHeight: 17, paddingTop: spacing.md },
  saveButton: { marginTop: spacing.lg },
});
