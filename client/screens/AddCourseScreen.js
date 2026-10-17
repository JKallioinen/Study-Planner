import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { saveCourse } from "../database/sqlite";

export default function AddCourseScreen({ navigation }) {
  const [name, setName] = useState("");

  const handleSave = () => {
    const courseName = name.trim();
    if (!courseName) {
      Alert.alert("Course name required", "Enter a name for this course.");
      return;
    }

    const course = saveCourse(courseName);
    if (!course.created) {
      Alert.alert("Course already exists", `"${course.name}" is already in your courses.`);
      return;
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add course</Text>
      <TextInput
        accessibilityLabel="Course name"
        autoCapitalize="words"
        onChangeText={setName}
        onSubmitEditing={handleSave}
        placeholder="Course name"
        returnKeyType="done"
        style={styles.input}
        value={name}
      />
      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleSave}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Add course</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 20,
  },
  heading: {
    color: "#172033",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#2D7BEA",
    borderRadius: 12,
    marginTop: 16,
    paddingVertical: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
