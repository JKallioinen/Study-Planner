import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import TabNavigator from "./navigation/TabNavigator";
import EditTaskScreen from "./screens/EditTaskScreen";

const Stack =
  createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator>

        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="EditTask"
          component={EditTaskScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}