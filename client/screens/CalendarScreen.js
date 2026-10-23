import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";

import db from "../database/sqlite";

// Shared color theme
const COLORS = {
  background: "#F5F6FA",
  white: "#FFFFFF",
  blue: "#4285F4",
  text: "#202938",
  gray: "#7A8595",
  lightGray: "#E8EBF0",
  orange: "#F4A000",
  purple: "#9254EB",
  green: "#27AE60",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Ensures date strings are stripped of any timestamps
const normalizeDate = (value) => {
  if (!value) return "";
  return String(value).split("T")[0].trim();
};

// Formats 'YYYY-MM-DD' into a friendly label like 'October 18'
const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
};

// Formats 'YYYY-MM-DD' into short 'DD.MM' format for upcoming lists
const formatShortDate = (dateString) => {
  const [year, month, day] = normalizeDate(dateString).split("-");
  if (!year || !month || !day) return dateString;
  return `${day}.${month}.`;
};

// Assigns dot and badge colors based on task priority level
const getPriorityColor = (priority) => {
  switch (priority) {
    case "High": return COLORS.purple;
    case "Medium": return COLORS.orange;
    case "Low": return COLORS.green;
    default: return COLORS.blue;
  }
};

export default function CalendarScreen({ navigation }) {
  const today = new Date();
  
  // Pre-calculated current date string in YYYY-MM-DD format
  const todayString = normalizeDate(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  // Component states for tasks data, active month view, and user-selected date
  const [tasks, setTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(todayString);
  const [selectedDate, setSelectedDate] = useState(todayString);

  // Loads all tasks from the local SQLite database
  const loadTasks = () => {
    try {
      const data = db.getAllSync("SELECT * FROM tasks ORDER BY id DESC");
      setTasks(data);
    } catch (error) {
      console.error("Failed to load calendar tasks:", error);
      Alert.alert("Error", "Could not load your tasks.");
    }
  };

  // Reloads tasks automatically whenever the user navigates back to this screen
  useEffect(() => {
    loadTasks();
    const unsubscribe = navigation.addListener("focus", loadTasks);
    return unsubscribe;
  }, [navigation]);

  // Maps database tasks into the format required by react-native-calendars (multi-dots)
  const getMarkedDates = () => {
    let marked = {};

    tasks.forEach((task) => {
      const date = normalizeDate(task.dueDate);
      if (!date) return;

      const dotColor = getPriorityColor(task.priority);

      if (!marked[date]) {
        marked[date] = { dots: [] };
      }

      // Limit to 3 priority dots per calendar day cell
      if (marked[date].dots.length < 3) {
        marked[date].dots.push({ key: `${task.id}`, color: dotColor });
      }
    });

    // Highlight the user's currently selected calendar date
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.blue,
    };

    return marked;
  };

  // Filter tasks that match the currently selected date on the calendar
  const selectedTasks = tasks.filter((task) => {
    return normalizeDate(task.dueDate) === selectedDate;
  });

  // Filter pending upcoming tasks (due today or later), sorted chronologically
  const upcomingTasks = tasks
    .filter((task) => {
      const date = normalizeDate(task.dueDate);
      return date && date >= todayString && task.status !== "Completed";
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Toggles task completion status in SQLite and refreshes local state
  const toggleTask = (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";

    try {
      db.runSync("UPDATE tasks SET status = ? WHERE id = ?", [newStatus, task.id]);
      loadTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      Alert.alert("Error", "Could not update the task.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Branding & Title */}
        <Text style={styles.logo}>Study planner</Text>
        <Text style={styles.screenTitle}>Calendar</Text>

        {/* External Calendar Library Component */}
        <View style={styles.card}>
          <Calendar
            current={currentMonth}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setCurrentMonth(day.dateString);
            }}
            markedDates={getMarkedDates()}
            markingType={"multi-dot"}
            theme={{
              backgroundColor: COLORS.white,
              calendarBackground: COLORS.white,
              textSectionTitleColor: COLORS.gray,
              selectedDayBackgroundColor: COLORS.blue,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.blue,
              arrowColor: COLORS.blue,
              monthTextColor: COLORS.text,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 15,
              textMonthFontSize: 18,
            }}
          />
        </View>

        {/* Selected Date Tasks Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Tasks for {formatDate(selectedDate)}</Text>

          {selectedTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for this day.</Text>
          ) : (
            selectedTasks.map((task) => {
              const completed = task.status === "Completed";

              return (
                <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => toggleTask(task)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, completed && styles.checkedBox]}>
                    {completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, completed && styles.completedTaskTitle]}>{task.title}</Text>
                    <Text style={styles.taskSubtitle}>{task.course} · {task.priority} Priority</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Upcoming Tasks Card */}
        <View style={styles.card}>
          <Text style={styles.upcomingTitle}>Upcoming Tasks</Text>
          
          {upcomingTasks.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming tasks.</Text>
          ) : (
            upcomingTasks.map((task, index) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.upcomingRow, index === upcomingTasks.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => {
                  const normalized = normalizeDate(task.dueDate);
                  setSelectedDate(normalized);
                  setCurrentMonth(normalized);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.upcomingDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTaskTitle}>{task.title}</Text>
                  <Text style={styles.upcomingSubtitle}>
                    {task.course} · {formatShortDate(task.dueDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  // --- Logo & Titles ---
  logo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.text,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },

  // --- Selected Date Task Rows ---
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    borderRadius: 4,
    marginTop: 2,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "bold",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text,
  },
  completedTaskTitle: {
    textDecorationLine: "line-through",
    color: COLORS.gray,
  },
  taskSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    paddingVertical: 4,
  },

  // --- Upcoming Tasks Section ---
  upcomingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  upcomingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  upcomingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTaskTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  upcomingSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
});