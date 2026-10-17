import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MyCoursesNavigator from "./MyCoursesNavigator";

const Tab =
  createBottomTabNavigator();

const tabIcon = (symbol) => ({ color }) => (
  <Text style={{ color, fontSize: 22, lineHeight: 26 }}>
    {symbol}
  </Text>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2D7BEA",
        tabBarInactiveTintColor: "#68778D",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E2E8F0",
        },
      }}
    >

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: tabIcon("⌂") }}
      />

      <Tab.Screen
        name="Courses"
        component={MyCoursesNavigator}
        options={{ tabBarIcon: tabIcon("▤") }}
      />

      <Tab.Screen
        name="Add"
        component={AddTaskScreen}
        options={{ tabBarIcon: tabIcon("＋") }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: tabIcon("⚙") }}
      />

    </Tab.Navigator>
  );
}