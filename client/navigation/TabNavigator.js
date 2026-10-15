import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import AddTaskScreen from "../screens/AddTaskScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab =
  createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Add"
        component={AddTaskScreen}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />

    </Tab.Navigator>
  );
}