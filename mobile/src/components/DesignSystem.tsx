import type { PropsWithChildren, ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  type StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radii, spacing, typography } from "../theme/tokens";

export type TabName = "Home" | "ActivityFeed" | "Requests" | "Profile";

const tabItems: { name: TabName; label: string; icon: string }[] = [
  { name: "Home", label: "Home", icon: "⌂" },
  { name: "ActivityFeed", label: "Explore", icon: "⌕" },
  { name: "Requests", label: "Requests", icon: "♡" },
  { name: "Profile", label: "Profile", icon: "○" },
];

export function Page({
  children,
  activeTab,
  showTabs = true,
  onTabSelect,
  scrollable = true,
}: PropsWithChildren<{
  activeTab?: TabName;
  showTabs?: boolean;
  onTabSelect?: (tab: TabName) => void;
  scrollable?: boolean;
}>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.pageContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, styles.pageContent]}>{children}</View>
      )}
      {showTabs && onTabSelect ? (
        <BottomTabs activeTab={activeTab} onTabSelect={onTabSelect} />
      ) : null}
    </SafeAreaView>
  );
}

export function BrandMark({ size = 42 }: { size?: number }) {
  return (
    <View
      accessibilityLabel="CampusMatcher"
      style={[styles.brandMark, { width: size, height: size, borderRadius: size * 0.34 }]}
    >
      <View style={styles.brandLeaf} />
      <View style={styles.brandDot} />
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
        ) : null}
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  icon?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyles[variant],
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {icon ? <Text style={[styles.buttonIcon, textButtonStyles[variant]]}>{icon}</Text> : null}
      <Text style={[styles.buttonText, textButtonStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({
  label,
  tone = "green",
}: {
  label: string;
  tone?: "green" | "peach" | "lavender" | "muted";
}) {
  return (
    <View style={[styles.tag, tagStyles[tone]]}>
      <Text style={[styles.tagText, tagTextStyles[tone]]}>{label}</Text>
    </View>
  );
}

export function Avatar({
  initials,
  size = 44,
  tone = "green",
}: {
  initials: string;
  size?: number;
  tone?: "green" | "peach" | "lavender";
}) {
  return (
    <View
      style={[
        styles.avatar,
        avatarStyles[tone],
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        style={[styles.field, multiline ? styles.multilineField : null]}
        value={value}
      />
    </View>
  );
}

function BottomTabs({
  activeTab,
  onTabSelect,
}: {
  activeTab?: TabName;
  onTabSelect: (tab: TabName) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.tabBar}>
      {tabItems.map((item) => (
        <Pressable
          key={item.name}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === item.name }}
          onPress={() => onTabSelect(item.name)}
          style={styles.tabItem}
        >
          <Text style={[styles.tabIcon, activeTab === item.name ? styles.tabActive : null]}>
            {item.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === item.name ? styles.tabActive : null]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const buttonStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySoft },
  quiet: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.dangerSoft },
});

const textButtonStyles = StyleSheet.create({
  primary: { color: colors.surface },
  secondary: { color: colors.primaryDark },
  quiet: { color: colors.primary },
  danger: { color: colors.danger },
});

const tagStyles = StyleSheet.create({
  green: { backgroundColor: colors.primarySoft },
  peach: { backgroundColor: colors.peach },
  lavender: { backgroundColor: colors.lavender },
  muted: { backgroundColor: colors.canvas },
});

const tagTextStyles = StyleSheet.create({
  green: { color: colors.primaryDark },
  peach: { color: colors.ink },
  lavender: { color: colors.ink },
  muted: { color: colors.muted },
});

const avatarStyles = StyleSheet.create({
  green: { backgroundColor: colors.primarySoft },
  peach: { backgroundColor: colors.peach },
  lavender: { backgroundColor: colors.lavender },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  scroll: { flex: 1 },
  pageContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  brandMark: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  brandLeaf: {
    width: "45%",
    height: "58%",
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
    transform: [{ rotate: "-35deg" }],
  },
  brandDot: {
    position: "absolute",
    width: 7,
    height: 7,
    right: "19%",
    top: "19%",
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
  },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.xl },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  backGlyph: { color: colors.ink, fontSize: 30, lineHeight: 34, marginTop: -4 },
  headerText: { flex: 1 },
  headerTitle: { color: colors.ink, fontSize: typography.title, fontWeight: "800", letterSpacing: -0.5 },
  headerSubtitle: { color: colors.muted, fontSize: typography.label, marginTop: 3 },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.ink, fontSize: typography.heading, fontWeight: "700" },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  button: {
    minHeight: 50,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: typography.body, fontWeight: "700" },
  buttonIcon: { fontSize: 19, fontWeight: "600" },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: typography.label, fontWeight: "600" },
  chipTextSelected: { color: colors.surface },
  tag: { alignSelf: "flex-start", borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: typography.caption, fontWeight: "700" },
  avatar: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.ink, fontSize: typography.label, fontWeight: "800" },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { color: colors.ink, fontSize: typography.label, fontWeight: "700", marginBottom: spacing.sm },
  field: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    fontSize: typography.body,
  },
  multilineField: { minHeight: 96, paddingTop: spacing.md, textAlignVertical: "top" },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  tabItem: { alignItems: "center", gap: 2, minWidth: 64, paddingVertical: spacing.xs },
  tabIcon: { fontSize: 20, color: colors.muted },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: "600" },
  tabActive: { color: colors.primary, fontWeight: "800" },
});
