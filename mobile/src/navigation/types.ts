export type RootStackParamList = {
  Welcome: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  Login: undefined;
  Home: undefined;
  ActivityFeed: undefined;
  ActivityDetail: { activityId: string };
  CreateActivity: undefined;
  Requests: { tab?: "Incoming" | "Sent" } | undefined;
  Chat: { requestId: string };
  Report: { activityId?: string; memberId?: string } | undefined;
  MemberProfile: { memberId: string };
  Profile: undefined;
  EditProfile: undefined;
  Safety: undefined;
  AdminReports: undefined;
};
