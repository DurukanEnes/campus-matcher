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
  Report: { activityId?: string } | undefined;
  Profile: undefined;
  EditProfile: undefined;
  Safety: undefined;
  AdminReports: undefined;
};
