import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import db from "../database/sqlite";

export default function EditTaskScreen({
  route,
  navigation,
}) {
  const { task } = route.params;

  const [title, setTitle] = useState(task.title);
  const [course, setCourse] = useState(task.course);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const [priority, setPriority] = useState(
    task.priority || "Medium"
  );

  const [status, setStatus] = useState(
    task.status || "Pending"
  );

  const [taskType, setTaskType] = useState(
    task.taskType || "Assignment"
  );

  const updateTask = () => {
    db.runSync(
      `
      UPDATE tasks
      SET
        title=?,
        course=?,
        description=?,
        dueDate=?,
        priority=?,
        status=?,
        taskType=?
      WHERE id=?
      `,
      [
        title,
        course.trim(),
        description,
        dueDate,
        priority,
        status,
        taskType,
        task.id,
      ]
    );

    Alert.alert(
      "Success",
      "Task Updated Successfully"
    );

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Edit Task
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Course"
        value={course}
        onChangeText={setCourse}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="DD-MM-YYYY"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <Text style={styles.label}>
        Type
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={taskType}
          onValueChange={setTaskType}
        >
          <Picker.Item
            label="Assignment"
            value="Assignment"
          />
          <Picker.Item
            label="Exam"
            value="Exam"
          />
        </Picker>
      </View>

      <Text style={styles.label}>
        Priority
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) =>
            setPriority(itemValue)
          }
        >
          <Picker.Item
            label="High"
            value="High"
          />
          <Picker.Item
            label="Medium"
            value="Medium"
          />
          <Picker.Item
            label="Low"
            value="Low"
          />
        </Picker>
      </View>

      <Text style={styles.label}>
        Status
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={status}
          onValueChange={(itemValue) =>
            setStatus(itemValue)
          }
        >
          <Picker.Item
            label="Pending"
            value="Pending"
          />
          <Picker.Item
            label="In Progress"
            value="In Progress"
          />
          <Picker.Item
            label="Completed"
            value="Completed"
          />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={updateTask}
      >
        <Text style={styles.buttonText}>
          Update Task
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 5,
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#3498DB",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
