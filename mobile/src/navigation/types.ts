export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  VerifyEmail: undefined;
  Login: undefined;
  Home: undefined;
  ActivityFeed: undefined;
  ActivityDetail: { activityId: string };
  CreateActivity: undefined;
  Requests: { tab?: "Incoming" | "Sent" } | undefined;
  Chat: { activityId: string };
  Report: { activityId?: string; memberId?: string } | undefined;
  MemberProfile: { memberId: string };
  Profile: undefined;
  EditProfile: undefined;
  Safety: undefined;
  AdminReports: undefined;
};
