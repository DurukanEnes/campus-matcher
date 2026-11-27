import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Avatar, Button, Card, Chip, Page, PageHeader, SectionTitle, Tag } from "../components/DesignSystem";
import { CURRENT_MEMBER_ID, usePrototypeData } from "../prototype/PrototypeData";
import type { Report } from "../prototype/PrototypeData";
import type { RootStackParamList } from "../navigation/types";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { MenuRow } from "./ProfileScreens";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type MemberRoute = RouteProp<RootStackParamList, "MemberProfile">;

/** Another member's public profile, with the block and report actions (US-12, US-13). */
export function MemberProfileScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<MemberRoute>();
  const { members, blockedIds, blockMember, unblockMember } = usePrototypeData();
  const member = members[route.params.memberId];

  if (!member || member.status === "suspended" || member.id === CURRENT_MEMBER_ID) {
    return (
      <Page showTabs={false}>
        <PageHeader title="Profile unavailable" subtitle="This account can’t be viewed" onBack={() => navigation.goBack()} />
        <Button label="Back to activities" variant="secondary" onPress={() => navigation.navigate("ActivityFeed")} />
      </Page>
    );
  }

  const isBlocked = blockedIds.includes(member.id);
  const confirmBlock = () =>
    Alert.alert(
      `Block ${member.name}?`,
      "You won’t see each other’s posts, and they can’t send you join requests or messages.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block", style: "destructive", onPress: () => blockMember(member.id) },
      ],
    );

  return (
    <Page showTabs={false}>
      <PageHeader title="Member profile" subtitle="Who you might meet" onBack={() => navigation.goBack()} />
      <Card style={styles.profileCard}>
        <Avatar initials={member.initials} size={68} tone="lavender" />
        <Text style={styles.name}>{member.name}</Text>
        <Text style={styles.muted}>{member.department} · İTÜ member</Text>
      </Card>
      {isBlocked ? (
        <Card style={styles.noticeCard}>
          <Text style={styles.cardTitle}>You’ve blocked {member.name}</Text>
          <Text style={styles.muted}>You don’t see each other’s posts, and they can’t contact you.</Text>
        </Card>
      ) : null}
      <SectionTitle title="Safety" />
      <View style={styles.actions}>
        <Button
          label={`Report ${member.name}`}
          variant="secondary"
          onPress={() => navigation.navigate("Report", { memberId: member.id })}
        />
        {isBlocked ? (
          <Button label={`Unblock ${member.name}`} variant="quiet" onPress={() => unblockMember(member.id)} />
        ) : (
          <Button label={`Block ${member.name}`} variant="danger" onPress={confirmBlock} />
        )}
      </View>
      <Text style={styles.footnote}>Reports are private. Blocking is silent: the other member is not told.</Text>
    </Page>
  );
}

/** The member's own block list (FR-20). */
export function SafetyScreen() {
  const navigation = useNavigation<Navigation>();
  const { members, blockedIds, unblockMember } = usePrototypeData();
  const blocked = blockedIds.map((id) => members[id]).filter(Boolean);
  return (
    <Page showTabs={false}>
      <PageHeader title="Your safety" subtitle="Feel comfortable showing up" onBack={() => navigation.goBack()} />
      <Text style={styles.intro}>You’re in control of who can see your posts and reach you.</Text>
      <SectionTitle title="Blocked accounts" />
      {blocked.length ? (
        blocked.map((member) => (
          <MenuRow
            key={member.id}
            label={member.name}
            detail="Hidden from your feed and can’t contact you"
            icon="⊘"
            action="Unblock"
            accessibilityLabel={`Unblock ${member.name}`}
            onPress={() => unblockMember(member.id)}
          />
        ))
      ) : (
        <Card style={styles.noticeCard}>
          <Text style={styles.cardTitle}>Your block list is clear.</Text>
          <Text style={styles.muted}>Block someone from their profile to hide each other’s posts and stop contact.</Text>
        </Card>
      )}
      <SectionTitle title="Need a hand?" />
      <Card style={styles.noticeCard}>
        <Text style={styles.cardTitle}>Report something that feels off</Text>
        <Text style={styles.muted}>
          Open the member’s profile or their activity and tap Report. Reports are private and reviewed by an administrator.
        </Text>
      </Card>
    </Page>
  );
}

type ReportTab = "Open" | "Handled";

/** Admin-only report review: dismiss a report or suspend the reported account (US-14). */
export function AdminReportsScreen() {
  const navigation = useNavigation<Navigation>();
  const { role, reports, members, activities, dismissReport, suspendMember } = usePrototypeData();
  const [tab, setTab] = useState<ReportTab>("Open");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (role !== "admin") {
    return (
      <Page showTabs={false}>
        <PageHeader title="Access refused" subtitle="Administrators only" onBack={() => navigation.goBack()} />
        <Card style={styles.noticeCard}>
          <Text style={styles.cardTitle}>Only administrators can open the report list.</Text>
          <Text style={styles.muted}>If you think something needs review, report it from the member’s profile or activity.</Text>
        </Card>
      </Page>
    );
  }

  const visible = reports.filter((report) => (tab === "Open" ? report.status === "pending" : report.status !== "pending"));
  const selected = visible.find((report) => report.id === selectedId) ?? visible[0];
  const describe = (report: Report) => {
    const activity = report.activityId ? activities.find((item) => item.id === report.activityId) : undefined;
    return {
      member: members[report.reportedMemberId],
      title: activity ? `Activity post · ${activity.venue}` : members[report.reportedMemberId]?.name ?? "Member",
    };
  };

  const confirmSuspend = (report: Report) => {
    const name = members[report.reportedMemberId]?.name ?? "this member";
    Alert.alert(
      `Suspend ${name}?`,
      "They will be signed out, can’t log in again, and their open posts will be hidden from the feed.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Suspend", style: "destructive", onPress: () => suspendMember(report.id) },
      ],
    );
  };

  return (
    <Page showTabs={false}>
      <PageHeader title="Admin · Reports" subtitle="Review and keep campus safe" onBack={() => navigation.goBack()} />
      <View style={styles.adminNotice}><Text style={styles.adminNoticeText}>ADMIN ROLE ONLY</Text></View>
      <View style={styles.tabs}>
        {(["Open", "Handled"] as const).map((name) => (
          <Chip key={name} label={name} selected={tab === name} onPress={() => setTab(name)} />
        ))}
      </View>
      {visible.length === 0 ? (
        <Card style={styles.noticeCard}>
          <Text style={styles.cardTitle}>{tab === "Open" ? "No open reports." : "No handled reports yet."}</Text>
          <Text style={styles.muted}>{tab === "Open" ? "Nice and quiet on campus." : "Dismissed and resolved reports appear here."}</Text>
        </Card>
      ) : (
        <>
          {visible.map((report) => (
            <MenuRow
              key={report.id}
              label={describe(report).title}
              detail={`${report.reason} · ${report.submitted}`}
              icon={report.activityId ? "▤" : "○"}
              action={selected?.id === report.id ? "Selected" : undefined}
              onPress={() => setSelectedId(report.id)}
            />
          ))}
          {selected ? (
            <>
              <SectionTitle
                title="Report details"
                action={<Tag label={selected.status.toUpperCase()} tone={selected.status === "pending" ? "peach" : "muted"} />}
              />
              <Card style={styles.detailCard}>
                <Text style={styles.cardTitle}>{describe(selected).title}</Text>
                <Text style={styles.muted}>Reported member: {describe(selected).member?.name ?? "Unknown"}</Text>
                <Text style={styles.muted}>Reason: {selected.reason}</Text>
                <Text style={styles.muted}>Reported by {selected.reporter} · {selected.submitted}</Text>
                <Text style={styles.reportBody}>{selected.details ? `“${selected.details}”` : "No description given."}</Text>
                {describe(selected).member?.status === "suspended" ? (
                  <Text style={styles.suspended}>Account suspended</Text>
                ) : null}
              </Card>
              {selected.status === "pending" ? (
                <View style={styles.actions}>
                  <Button label="Dismiss report" variant="secondary" onPress={() => dismissReport(selected.id)} />
                  <Button label="Suspend account" variant="danger" onPress={() => confirmSuspend(selected)} />
                </View>
              ) : null}
            </>
          ) : null}
        </>
      )}
      <Text style={styles.footnote}>Prototype · Actions change sample data on this device only.</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.sm },
  name: { color: colors.ink, fontSize: typography.heading, fontWeight: "800", marginTop: spacing.sm },
  muted: { color: colors.muted, fontSize: typography.label, lineHeight: 20 },
  intro: { color: colors.muted, fontSize: typography.body, lineHeight: 22 },
  noticeCard: { gap: spacing.sm, borderRadius: radii.lg, marginTop: spacing.md },
  detailCard: { gap: spacing.xs },
  cardTitle: { color: colors.ink, fontSize: typography.label, fontWeight: "700" },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
  tabs: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.lg },
  adminNotice: { padding: spacing.md, borderRadius: radii.md, backgroundColor: colors.lavender, alignItems: "center" },
  adminNoticeText: { color: colors.ink, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  reportBody: { color: colors.ink, fontSize: typography.label, lineHeight: 20, marginTop: spacing.sm },
  suspended: { color: colors.danger, fontSize: typography.label, fontWeight: "700", marginTop: spacing.sm },
  footnote: { color: colors.muted, fontSize: typography.caption, textAlign: "center", lineHeight: 17, paddingTop: spacing.lg },
});
