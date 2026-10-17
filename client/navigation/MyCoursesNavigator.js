import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CourseDetailsScreen from "../screens/CourseDetailsScreen";
import ProgressScreen from "../screens/ProgressScreen";

const Stack = createNativeStackNavigator();

export default function MyCoursesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerBackVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#F7F8FA" },
        headerTitle: "Study planner",
        headerTitleStyle: { color: "#111827", fontSize: 22, fontWeight: "700" },
      }}
    >
      <Stack.Screen
        name="CourseList"
        component={ProgressScreen}
      />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
      />
    </Stack.Navigator>
  );
}
