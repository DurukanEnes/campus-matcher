import { createContext, useContext, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";

export type ActivityCategory = "Library" | "Gym" | "Cafeteria";
export type ActivityStatus = "open" | "matched";
export type RequestStatus = "pending" | "accepted" | "declined";

export type Activity = {
  id: string;
  category: ActivityCategory;
  venue: string;
  date: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  note: string;
  host: string;
  initials: string;
  status: ActivityStatus;
};

export type JoinRequest = {
  id: string;
  activityId: string;
  requester: string;
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

type NewActivity = Omit<Activity, "id" | "host" | "initials" | "status">;

type PrototypeState = {
  activities: Activity[];
  requests: JoinRequest[];
  profile: Profile;
  addActivity: (activity: NewActivity) => void;
  sendRequest: (activityId: string, message: string) => void;
  updateRequest: (requestId: string, status: Exclude<RequestStatus, "pending">) => void;
  updateProfile: (profile: Profile) => void;
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
    host: "Ada Demir",
    initials: "AD",
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
    host: "You",
    initials: "EO",
    status: "open",
  },
];

const initialRequests: JoinRequest[] = [
  {
    id: "request-demo",
    activityId: "activity-cafe",
    requester: "Deniz Aydın",
    initials: "DA",
    message: "Hi! I have a free hour after class. Mind if I join?",
    status: "pending",
    direction: "incoming",
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
            host: "You",
            initials: "EO",
            status: "open",
          },
          ...current,
        ]);
      },
      sendRequest: (activityId, message) => {
        const id = `request-new-${nextId.current++}`;
        setRequests((current) => [
          {
            id,
            activityId,
            requester: "You",
            initials: "EO",
            message,
            status: "pending",
            direction: "outgoing",
          },
          ...current,
        ]);
      },
      updateRequest: (requestId, status) => {
        setRequests((current) =>
          current.map((request) =>
            request.id === requestId ? { ...request, status } : request,
          ),
        );
        if (status === "accepted") {
          const request = requests.find((item) => item.id === requestId);
          if (request) {
            setActivities((current) =>
              current.map((activity) =>
                activity.id === request.activityId
                  ? { ...activity, status: "matched" }
                  : activity,
              ),
            );
          }
        }
      },
      updateProfile: (nextProfile) => setProfile(nextProfile),
    }),
    [activities, profile, requests],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototypeData(): PrototypeState {
  const context = useContext(PrototypeContext);
  if (!context) {
    throw new Error("Prototype screens must be rendered inside PrototypeProvider.");
  }
  return context;
}
