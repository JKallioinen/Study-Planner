import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import db from "../database/sqlite";

export default function AddTaskScreen() {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [priority, setPriority] =
    useState("Medium");

  const [status, setStatus] =
    useState("Pending");

  const formatDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const saveTask = () => {
    if (!title.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a task title."
      );
      return;
    }

    const formattedDueDate = formatDateString(date);

    db.runSync(
      `
      INSERT INTO tasks
      (
        title,
        course,
        description,
        dueDate,
        priority,
        status,
        taskType
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        title,
        course.trim(),
        description,
        formattedDueDate,
        priority,
        status,
        taskType,
      ]
    );

    Alert.alert(
      "Success",
      "Task Saved Successfully"
    );

    setTitle("");
    setCourse("");
    setDescription("");
    setDate(new Date());
    setPriority("Medium");
    setStatus("Pending");
    setTaskType("Assignment");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Add New Task
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

      {/* Date Picker Trigger Button */}
      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateButtonText}>
          📅 {formatDateString(date)}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onValueChange={onDateChange}
        />
      )}

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
        onPress={saveTask}
      >
        <Text style={styles.buttonText}>
          Save Task
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
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 5,
  },

  dateButton: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },

  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },

  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
});
