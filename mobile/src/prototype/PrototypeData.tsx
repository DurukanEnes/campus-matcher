import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

export type ActivityCategory = "Library" | "Gym" | "Cafeteria";
export type ActivityStatus = "open" | "matched";
export type RequestStatus = "pending" | "accepted" | "declined";
export type SendRequestResult = "sent" | "own-post" | "closed" | "duplicate" | "blocked" | "not-found";
export type Role = "member" | "admin";
export type MemberStatus = "active" | "suspended";
/** Report reasons follow the `reports.reason` values of the database schema (WBS-1.2). */
export type ReportReason = "Harassment" | "Spam" | "Inappropriate behavior" | "Other";
export type ReportStatus = "pending" | "resolved" | "dismissed";

/** The signed-in member in the prototype. */
export const CURRENT_MEMBER_ID = "me";

export type Member = {
  id: string;
  name: string;
  initials: string;
  department: string;
  status: MemberStatus;
};

export type Report = {
  id: string;
  reporter: string;
  reportedMemberId: string;
  /** Set when a post was reported; the report is still about the post's host. */
  activityId?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  submitted: string;
};

export type NewReport = Pick<Report, "reportedMemberId" | "activityId" | "reason" | "details">;

export type Activity = {
  id: string;
  category: ActivityCategory;
  venue: string;
  date: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  note: string;
  hostId: string;
  host: string;
  initials: string;
  status: ActivityStatus;
};

export type JoinRequest = {
  id: string;
  activityId: string;
  requesterId: string;
  requester: string;
  requesterDepartment: string;
  initials: string;
  message: string;
  status: RequestStatus;
  direction: "incoming" | "outgoing";
};

export type Profile = {
  name: string;
  department: string;
  interests: string;
  activityPreferences: ActivityCategory[];
};

type NewActivity = Omit<Activity, "id" | "hostId" | "host" | "initials" | "status">;

type PrototypeState = {
  activities: Activity[];
  requests: JoinRequest[];
  profile: Profile;
  addActivity: (activity: NewActivity) => void;
  sendRequest: (activityId: string, message: string) => SendRequestResult;
  updateRequest: (requestId: string, status: Exclude<RequestStatus, "pending">) => void;
  updateProfile: (profile: Profile) => void;
  members: Record<string, Member>;
  blockedIds: string[];
  reports: Report[];
  role: Role;
  blockMember: (memberId: string) => void;
  unblockMember: (memberId: string) => void;
  submitReport: (report: NewReport) => boolean;
  dismissReport: (reportId: string) => void;
  suspendMember: (reportId: string) => void;
  setRole: (role: Role) => void;
};

const initialActivities: Activity[] = [
  {
    id: "activity-library",
    category: "Library",
    venue: "Mustafa İnan Library",
    date: "Today",
    time: "16:30–18:00",
    period: "Afternoon",
    note: "Quiet focus session. Bring your own coffee!",
    hostId: "member-mert",
    host: "Mert Kaya",
    initials: "MK",
    status: "open",
  },
  {
    id: "activity-gym",
    category: "Gym",
    venue: "Ayazağa Campus Gym",
    date: "Today",
    time: "18:30–19:30",
    period: "Evening",
    note: "Beginner-friendly upper body session.",
    hostId: "member-ada",
    host: "Ada Demir",
    initials: "AD",
    status: "open",
  },
  {
    id: "activity-library-evening",
    category: "Library",
    venue: "Central Library",
    date: "Today",
    time: "19:00–23:00",
    period: "Evening",
    note: "Exam prep for Calculus II. Second floor, quiet zone.",
    hostId: "member-zeynep",
    host: "Zeynep Arslan",
    initials: "ZA",
    status: "open",
  },
  {
    id: "activity-gym-morning",
    category: "Gym",
    venue: "Ayazağa Campus Gym",
    date: "Tomorrow",
    time: "07:00–08:00",
    period: "Morning",
    note: "Early cardio before lectures.",
    hostId: "member-can",
    host: "Can Öztürk",
    initials: "CÖ",
    status: "open",
  },
  {
    id: "activity-cafe",
    category: "Cafeteria",
    venue: "Central Cafeteria",
    date: "Tomorrow",
    time: "12:00–13:00",
    period: "Afternoon",
    note: "Lunch between lectures?",
    hostId: "me",
    host: "You",
    initials: "EO",
    status: "open",
  },
];

const initialRequests: JoinRequest[] = [
  {
    id: "request-demo",
    activityId: "activity-cafe",
    requesterId: "member-deniz",
    requester: "Deniz Aydın",
    requesterDepartment: "Computer Engineering",
    initials: "DA",
    message: "Hi! I have a free hour after class. Mind if I join?",
    status: "pending",
    direction: "incoming",
  },
  {
    id: "request-second",
    activityId: "activity-cafe",
    requesterId: "member-selin",
    requester: "Selin Yıldız",
    requesterDepartment: "Industrial Design",
    initials: "SY",
    message: "Lunch sounds great, I'm nearby at that time.",
    status: "pending",
    direction: "incoming",
  },
];

const initialMembers: Record<string, Member> = Object.fromEntries(
  ([
    ["me", "Erinç Özarı", "EO", "Architecture"],
    ["member-mert", "Mert Kaya", "MK", "Electrical Engineering"],
    ["member-ada", "Ada Demir", "AD", "Physical Education"],
    ["member-zeynep", "Zeynep Arslan", "ZA", "Mathematics Engineering"],
    ["member-can", "Can Öztürk", "CÖ", "Civil Engineering"],
    ["member-deniz", "Deniz Aydın", "DA", "Computer Engineering"],
    ["member-selin", "Selin Yıldız", "SY", "Industrial Design"],
  ] as const).map(([id, name, initials, department]) => [id, { id, name, initials, department, status: "active" }]),
);

const initialReports: Report[] = [
  {
    id: "report-spam",
    reporter: "Zeynep Arslan",
    reportedMemberId: "member-can",
    reason: "Spam",
    details: "Sends the same advert in every join request.",
    status: "pending",
    submitted: "Today",
  },
  {
    id: "report-post",
    reporter: "Mert Kaya",
    reportedMemberId: "member-ada",
    activityId: "activity-gym",
    reason: "Inappropriate behavior",
    details: "The post note was changed to something offensive.",
    status: "pending",
    submitted: "Yesterday",
  },
];

const initialProfile: Profile = {
  name: "Erinç Özarı",
  department: "Architecture",
  interests: "Design, study sessions, coffee",
  activityPreferences: ["Library", "Cafeteria"],
};

const PrototypeContext = createContext<PrototypeState | null>(null);

export function PrototypeProvider({ children }: PropsWithChildren) {
  const [activities, setActivities] = useState(initialActivities);
  const [requests, setRequests] = useState(initialRequests);
  const [profile, setProfile] = useState(initialProfile);
  const [members, setMembers] = useState(initialMembers);
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [reports, setReports] = useState(initialReports);
  const [role, setRole] = useState<Role>("member");
  const nextId = useRef(1);

  const value = useMemo<PrototypeState>(
    () => ({
      activities,
      requests,
      profile,
      addActivity: (activity) => {
        const id = `activity-new-${nextId.current++}`;
        setActivities((current) => [
          {
            ...activity,
            id,
            hostId: CURRENT_MEMBER_ID,
            host: "You",
            initials: "EO",
            status: "open",
          },
          ...current,
        ]);
      },
      sendRequest: (activityId, message) => {
        const result = checkJoinRequest(activities, requests, activityId, { blockedIds, members });
        if (result !== "sent") {
          return result;
        }
        const id = `request-new-${nextId.current++}`;
        setRequests((current) => [
          {
            id,
            activityId,
            requesterId: CURRENT_MEMBER_ID,
            requester: "You",
            requesterDepartment: profile.department,
            initials: "EO",
            message,
            status: "pending",
            direction: "outgoing",
          },
          ...current,
        ]);
        return result;
      },
      updateRequest: (requestId, status) => {
        const request = requests.find((item) => item.id === requestId);
        if (!request || request.status !== "pending") {
          return;
        }
        setRequests((current) =>
          current.map((item) => {
            if (item.id === requestId) {
              return { ...item, status };
            }
            // FR-15: accepting one request declines the other pending requests for the same post.
            if (status === "accepted" && item.activityId === request.activityId && item.status === "pending") {
              return { ...item, status: "declined" };
            }
            return item;
          }),
        );
        if (status === "accepted") {
          setActivities((current) =>
            current.map((activity) =>
              activity.id === request.activityId
                ? { ...activity, status: "matched" }
                : activity,
            ),
          );
        }
      },
      updateProfile: (nextProfile) => setProfile(nextProfile),
      members,
      blockedIds,
      reports,
      role,
      blockMember: (memberId) => {
        if (memberId === CURRENT_MEMBER_ID) return;
        setBlockedIds((current) => (current.includes(memberId) ? current : [...current, memberId]));
      },
      unblockMember: (memberId) => setBlockedIds((current) => current.filter((id) => id !== memberId)),
      submitReport: (report) => {
        // The schema does not allow reporting yourself (ck_reports_different_users).
        if (report.reportedMemberId === CURRENT_MEMBER_ID || !members[report.reportedMemberId]) {
          return false;
        }
        const id = `report-new-${nextId.current++}`;
        setReports((current) => [
          { ...report, id, reporter: profile.name, status: "pending", submitted: "Just now" },
          ...current,
        ]);
        return true;
      },
      dismissReport: (reportId) =>
        setReports((current) =>
          current.map((report) =>
            report.id === reportId && report.status === "pending" ? { ...report, status: "dismissed" } : report,
          ),
        ),
      suspendMember: (reportId) => {
        const report = reports.find((item) => item.id === reportId);
        if (!report || report.status !== "pending") return;
        const memberId = report.reportedMemberId;
        setMembers((current) => ({ ...current, [memberId]: { ...current[memberId], status: "suspended" } }));
        // Every open report about the suspended member is handled by the suspension.
        setReports((current) =>
          current.map((item) =>
            item.reportedMemberId === memberId && item.status === "pending" ? { ...item, status: "resolved" } : item,
          ),
        );
      },
      setRole,
    }),
    [activities, blockedIds, members, profile, reports, requests, role],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

/** Mirrors the join request rules of FR-13 so the UI can show the same outcomes the API will return. */
export function checkJoinRequest(
  activities: Activity[],
  requests: JoinRequest[],
  activityId: string,
  safety: { blockedIds?: readonly string[]; members?: Record<string, Member> } = {},
): SendRequestResult {
  const activity = activities.find((item) => item.id === activityId);
  if (!activity) return "not-found";
  // FR-23: a suspended member's posts are hidden, so they behave as if they do not exist.
  if (safety.members?.[activity.hostId]?.status === "suspended") return "not-found";
  if (activity.hostId === CURRENT_MEMBER_ID) return "own-post";
  // FR-20: no join requests to a member you have blocked.
  if (safety.blockedIds?.includes(activity.hostId)) return "blocked";
  if (activity.status !== "open") return "closed";
  const hasPending = requests.some(
    (request) =>
      request.activityId === activityId &&
      request.direction === "outgoing" &&
      request.status === "pending",
  );
  return hasPending ? "duplicate" : "sent";
}

/** Members whose posts and requests the signed-in member must not see: blocked (FR-20) or suspended (FR-23). */
export function getHiddenMemberIds(members: Record<string, Member>, blockedIds: readonly string[]): Set<string> {
  const hidden = new Set(blockedIds);
  for (const member of Object.values(members)) {
    if (member.status === "suspended") hidden.add(member.id);
  }
  return hidden;
}

export function usePrototypeData(): PrototypeState {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error("Prototype screens must be rendered inside PrototypeProvider.");
  }
  return context;
}
