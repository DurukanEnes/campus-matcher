import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useRef } from "react";
import { AuthProvider } from "../auth/AuthContext";
import { ChatProvider } from "../chat/ChatContext";
import { PushNotifications, type PushNotificationsHandle } from "../notifications/PushNotifications";
import { PrototypeProvider } from "../prototype/PrototypeData";
import ActivityDetailScreen from "../screens/ActivityDetailScreen";
import ActivityFeedScreen from "../screens/ActivityFeedScreen";
import ChatScreen from "../screens/ChatScreen";
import CreateActivityScreen from "../screens/CreateActivityScreen";
import HomeScreen from "../screens/HomeScreen";
import RequestsScreen from "../screens/RequestsScreen";
import ReportScreen from "../screens/ReportScreen";
import { EditProfileScreen, ProfileScreen } from "../screens/ProfileScreens";
import { AdminReportsScreen, MemberProfileScreen, SafetyScreen } from "../screens/ModerationScreens";
import { LoginScreen, RegisterScreen, VerifyEmailScreen } from "../screens/AuthScreens";
import WelcomeScreen from "../screens/WelcomeScreen";
import type { RootStackParamList } from "./types";
import { colors } from "../theme/tokens";

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export default function AppNavigator() {
  const push = useRef<PushNotificationsHandle>(null);

  return (
    <AuthProvider>
      <PrototypeProvider>
        <ChatProvider>
          <PushNotifications navigation={navigationRef} ref={push} />
          <NavigationContainer ref={navigationRef} onReady={() => push.current?.onNavigationReady()}>
            <Stack.Navigator
              initialRouteName="Welcome"
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.canvas },
                animation: "slide_from_right",
              }}
            >
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} />
              <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
              <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
              <Stack.Screen name="Requests" component={RequestsScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Report" component={ReportScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="Safety" component={SafetyScreen} />
              <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
              <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ChatProvider>
      </PrototypeProvider>
    </AuthProvider>
  );
}
