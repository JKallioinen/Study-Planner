import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from "../screens/HomeScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CalendarScreen from "../screens/CalendarScreen";

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4285F4",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Add") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Courses") {
            iconName = focused ? "book" : "book-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
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

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
      />

    </Tab.Navigator>
  );
}