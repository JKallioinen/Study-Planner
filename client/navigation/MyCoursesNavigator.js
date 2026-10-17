import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text } from "react-native";

import AddCourseScreen from "../screens/AddCourseScreen";
import CourseDetailsScreen from "../screens/CourseDetailsScreen";
import ProgressScreen from "../screens/ProgressScreen";

const Stack = createNativeStackNavigator();

export default function MyCoursesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => navigation.getParent()?.navigate("Settings")}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </Pressable>
        ),
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#F7F8FA" },
        headerTitle: "Study planner",
        headerTitleStyle: styles.headerTitle,
      })}
    >
      <Stack.Screen
        name="CourseList"
        component={ProgressScreen}
      />
      <Stack.Screen
        name="AddCourse"
        component={AddCourseScreen}
      />
      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginRight: 16,
    paddingVertical: 4,
  },
  menuIcon: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
  },
});
