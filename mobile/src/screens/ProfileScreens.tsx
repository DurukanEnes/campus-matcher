import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card, Chip, Page, PageHeader, SectionTitle, Tag, Field } from "../components/DesignSystem";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Navigation>();
  return (
    <Page activeTab="Profile" onTabSelect={(tab) => navigation.navigate(tab)}>
      <PageHeader title="Your corner" subtitle="A little about you" />
      <Card style={styles.profileCard}>
        <Avatar initials="EO" size={68} />
        <Text style={styles.name}>Erinç Özarı</Text>
        <Text style={styles.faculty}>Architecture · İTÜ member</Text>
        <Button label="Edit profile" variant="secondary" onPress={() => navigation.navigate("EditProfile")} />
      </Card>
      <SectionTitle title="Things you’re into" />
      <View style={styles.chips}>
        <Tag label="DESIGN" tone="lavender" />
        <Tag label="STUDY SESSIONS" />
        <Tag label="COFFEE" tone="peach" />
      </View>
      <SectionTitle title="Your preferences" />
      <Card style={styles.preferenceCard}>
        <Text style={styles.preferenceTitle}>Activities I like</Text>
        <Text style={styles.preferenceText}>Library · Cafeteria</Text>
        <View style={styles.divider} />
        <Text style={styles.preferenceTitle}>Campus location</Text>
        <Text style={styles.preferenceText}>Ayazağa · chosen venues only</Text>
      </Card>
      <SectionTitle title="Safety & account" />
      <MenuRow label="Blocked accounts" detail="Manage who can contact you" icon="⊘" onPress={() => navigation.navigate("Safety")} />
      <MenuRow label="Admin moderation preview" detail="Admin-only screen concept" icon="▤" onPress={() => navigation.navigate("AdminReports")} />
      <Pressable onPress={() => Alert.alert("Demo account", "Sign-out is not connected in this prototype.")} style={styles.signOut}>
        <Text style={styles.signOutText}>Sign out of demo</Text>
      </Pressable>
      <Text style={styles.disclaimer}>Prototype profile · No personal data is saved</Text>
    </Page>
  );
}

export function EditProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState("Erinç Özarı");
  const [department, setDepartment] = useState("Architecture");
  const [interest, setInterest] = useState("Design, coffee, study sessions");
  return (
    <Page showTabs={false}>
      <PageHeader title="Edit your profile" subtitle="Make your intro feel like you" onBack={() => navigation.goBack()} />
      <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field label="Faculty or department" value={department} onChangeText={setDepartment} placeholder="Your department" />
      <Field label="Interests" value={interest} onChangeText={setInterest} placeholder="Add a few interests" multiline />
      <SectionTitle title="Activity preferences" />
      <View style={styles.chips}>
        <Chip label="Library" selected onPress={() => undefined} />
        <Chip label="Gym" onPress={() => undefined} />
        <Chip label="Cafeteria" selected onPress={() => undefined} />
      </View>
      <View style={styles.saveButton}>
        <Button label="Save preview" onPress={() => { Alert.alert("Saved for preview", "Profile changes are temporary in this prototype."); navigation.goBack(); }} />
      </View>
    </Page>
  );
}

export function SafetyScreen() {
  const navigation = useNavigation<Navigation>();
  const [blocked, setBlocked] = useState(false);
  return (
    <Page showTabs={false}>
      <PageHeader title="Your safety" subtitle="Feel comfortable showing up" onBack={() => navigation.goBack()} />
      <Text style={styles.safetyIntro}>You’re in control of who can see your posts and reach you.</Text>
      <SectionTitle title="Blocked accounts" />
      {blocked ? (
        <MenuRow label="Student account" detail="Blocked from your feed and messages" icon="⊘" onPress={() => setBlocked(false)} action="Unblock" />
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.preferenceTitle}>Your block list is clear.</Text>
          <Text style={styles.preferenceText}>Block someone from an activity or profile to hide each other’s posts and stop contact.</Text>
        </Card>
      )}
      <SectionTitle title="Need a hand?" />
      <Card style={styles.safetyCard}>
        <Text style={styles.preferenceTitle}>Report something that feels off</Text>
        <Text style={styles.preferenceText}>Reports are private and reviewed by an administrator.</Text>
        <View style={styles.saveButton}>
          <Button label="Report a user or post" variant="secondary" onPress={() => navigation.navigate("Report")} />
        </View>
      </Card>
      <SectionTitle title="Demo interaction" />
      <Button label={blocked ? "Unblock sample account" : "Block sample account"} variant="quiet" onPress={() => setBlocked(!blocked)} />
    </Page>
  );
}

export function AdminReportsScreen() {
  const navigation = useNavigation<Navigation>();
  const [status, setStatus] = useState<"Open" | "Dismissed" | "Suspended">("Open");
  const [selected, setSelected] = useState("student");
  const action = (next: "Dismissed" | "Suspended") => {
    setStatus(next);
    Alert.alert(next === "Dismissed" ? "Report dismissed" : "Account suspended", "This is a sample admin action; no account data changed.");
  };
  return (
    <Page showTabs={false}>
      <PageHeader title="Admin · Reports" subtitle="Restricted moderation preview" onBack={() => navigation.goBack()} />
      <View style={styles.adminNotice}><Text style={styles.adminNoticeText}>ADMIN ROLE ONLY · SAMPLE DATA</Text></View>
      <SectionTitle title="Open reports" action={<Tag label={status.toUpperCase()} tone={status === "Open" ? "peach" : "muted"} />} />
      <MenuRow label="Student account" detail="Spam · Reported today" icon="○" onPress={() => setSelected("student")} action={selected === "student" ? "Selected" : undefined} />
      <MenuRow label="Activity post" detail="Inappropriate content · Yesterday" icon="▤" onPress={() => setSelected("activity")} action={selected === "activity" ? "Selected" : undefined} />
      <SectionTitle title="Report details" />
      <Card style={styles.safetyCard}>
        <Text style={styles.preferenceTitle}>{selected === "student" ? "Student account" : "Activity post"}</Text>
        <Text style={styles.preferenceText}>Reason: {selected === "student" ? "Spam" : "Inappropriate content"}</Text>
        <Text style={styles.reportBody}>“Please review this content. It made me uncomfortable.”</Text>
      </Card>
      <View style={styles.adminActions}>
        <Button label="Dismiss report" variant="secondary" onPress={() => action("Dismissed")} />
        <Button label="Suspend account" variant="danger" onPress={() => action("Suspended")} />
      </View>
      <Text style={styles.disclaimer}>A real suspension requires an audit reason and confirmation.</Text>
    </Page>
  );
}

function MenuRow({
  label,
  detail,
  icon,
  onPress,
  action,
}: {
  label: string;
  detail: string;
  icon: string;
  onPress: () => void;
  action?: string;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuRow}>
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
  safetyIntro: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  emptyCard: { gap: spacing.sm, borderRadius: radii.lg },
  safetyCard: { gap: spacing.sm },
  adminNotice: { padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.lavender, alignItems: "center" },
  adminNoticeText: { color: colors.ink, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  reportBody: { color: colors.ink, fontSize: typography.label, lineHeight: 20, marginTop: spacing.sm },
  adminActions: { gap: spacing.sm, marginTop: spacing.lg },
});
