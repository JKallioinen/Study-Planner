import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

import db from "../database/sqlite";

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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Robust date normalizer supporting YYYY-MM-DD, DD-MM-YYYY, and slashes
const normalizeDate = (value) => {
  if (!value) return "";
  const dateString = String(value).split("T")[0].trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const separator = dateString.includes("/") ? "/" : "-";
  const parts = dateString.split(separator);

  if (parts.length === 3) {
    // If format is DD-MM-YYYY
    if (parts[0].length <= 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    // If format already happened to be YYYY-MM-DD split by separator
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
  }

  return "";
};

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return COLORS.purple;
    case "Medium":
      return COLORS.orange;
    case "Low":
      return COLORS.green;
    default:
      return COLORS.blue;
  }
};

export default function CalendarScreen({ navigation }) {
  const today = new Date();

  const [tasks, setTasks] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    normalizeDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(today.getDate()).padStart(2, "0")}`
    )
  );

  const loadTasks = () => {
    try {
      const data = db.getAllSync(
        "SELECT * FROM tasks ORDER BY id DESC"
      );
      // Helpful debug log to inspect database contents in your Metro terminal
      console.log("--- DATABASE TASKS LOADED ---", JSON.stringify(data, null, 2));
      setTasks(data);
    } catch (error) {
      console.error("Failed to load calendar tasks:", error);
      Alert.alert("Error", "Could not load your tasks.");
    }
  };

  useEffect(() => {
    loadTasks();
    const unsubscribe = navigation.addListener("focus", loadTasks);
    return unsubscribe;
  }, [navigation]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  const calendarDays = [
    ...Array(firstDayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  // Filter tasks that match the selected calendar date
  const selectedTasks = tasks.filter((task) => {
    return normalizeDate(task.dueDate) === selectedDate;
  });

  // Filter upcoming incomplete tasks
  const upcomingTasks = tasks
    .filter((task) => {
      const date = normalizeDate(task.dueDate);
      const todayString = normalizeDate(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(today.getDate()).padStart(2, "0")}`
      );
      return (
        date &&
        date >= todayString &&
        task.status !== "Completed"
      );
    })
    .sort((a, b) =>
      normalizeDate(a.dueDate).localeCompare(normalizeDate(b.dueDate))
    )
    .slice(0, 3);

  const changeMonth = (amount) => {
    setCurrentMonth(new Date(year, month + amount, 1));
  };

  const hasTasks = (day) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return tasks.some((task) => normalizeDate(task.dueDate) === date);
  };

  const toggleTask = (task) => {
    const newStatus =
      task.status === "Completed" ? "Pending" : "Completed";

    try {
      db.runSync("UPDATE tasks SET status = ? WHERE id = ?", [
        newStatus,
        task.id,
      ]);
      loadTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
      Alert.alert("Error", "Could not update the task.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer?.()}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>

          <Text style={styles.logo}>Study planner</Text>
        </View>

        <Text style={styles.screenTitle}>Calendar</Text>

        {/* Calendar Card Container */}
        <View style={styles.card}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthTitle}>
              {MONTHS[month]} {year}
            </Text>

            <View style={styles.monthButtons}>
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Names */}
          <View style={styles.weekRow}>
            {WEEKDAYS.map((day) => (
              <View key={day} style={styles.dayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Dates Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                );
              }

              const date = `${year}-${String(month + 1).padStart(
                2,
                "0"
              )}-${String(day).padStart(2, "0")}`;

              const isSelected = date === selectedDate;
              const isToday =
                date ===
                normalizeDate(
                  `${today.getFullYear()}-${String(
                    today.getMonth() + 1
                  ).padStart(2, "0")}-${String(today.getDate()).padStart(
                    2,
                    "0"
                  )}`
                );

              return (
                <TouchableOpacity
                  key={date}
                  style={styles.dayCell}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && styles.selectedDay,
                      !isSelected && isToday && styles.todayDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        !isSelected && isToday && styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>

                  {hasTasks(day) && (
                    <View style={styles.dotRow}>
                      {tasks
                        .filter(
                          (task) => normalizeDate(task.dueDate) === date
                        )
                        .slice(0, 3)
                        .map((task, dotIndex) => (
                          <View
                            key={`${task.id}-${dotIndex}`}
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor: getPriorityColor(
                                  task.priority
                                ),
                              },
                            ]}
                          />
                        ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tasks for Selected Date */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            Tasks for {formatDate(selectedDate)}
          </Text>

          {selectedTasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks for this day.</Text>
          ) : (
            selectedTasks.map((task) => {
              const completed = task.status === "Completed";

              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskRow}
                  onPress={() => toggleTask(task)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      completed && styles.checkedBox,
                    ]}
                  >
                    {completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>

                  <View style={styles.taskInfo}>
                    <Text
                      style={[
                        styles.taskTitle,
                        completed && styles.completedTaskTitle,
                      ]}
                    >
                      {task.title}
                    </Text>

                    <Text style={styles.taskSubtitle}>
                      {task.course} · {task.priority}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Upcoming Tasks Section */}
        <View style={styles.upcomingHeader}>
          <Text style={styles.upcomingTitle}>Upcoming Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tasks")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          {upcomingTasks.length === 0 ? (
            <Text style={styles.emptyText}>No upcoming tasks.</Text>
          ) : (
            upcomingTasks.map((task, index) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.upcomingRow,
                  index === upcomingTasks.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  const normalized = normalizeDate(task.dueDate);
                  setSelectedDate(normalized);
                  const [taskYear, taskMonth] = normalized
                    .split("-")
                    .map(Number);
                  if (taskYear && taskMonth) {
                    setCurrentMonth(new Date(taskYear, taskMonth - 1, 1));
                  }
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.upcomingDot,
                    {
                      backgroundColor: getPriorityColor(task.priority),
                    },
                  ]}
                />

                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTaskTitle}>
                    {task.title}
                  </Text>

                  <Text style={styles.upcomingSubtitle}>
                    {task.course} ·{" "}
                    {normalizeDate(task.dueDate)
                      .split("-")
                      .reverse()
                      .slice(0, 2)
                      .join(" ")}
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  menuButton: {
    marginRight: 14,
    paddingVertical: 4,
    paddingRight: 2,
  },

  menuIcon: {
    fontSize: 25,
    color: COLORS.text,
  },

  logo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#111111",
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },

  monthButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  arrowButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.gray,
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  weekdayText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray,
  },

  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  dayText: {
    fontSize: 15,
    color: COLORS.text,
  },

  selectedDay: {
    backgroundColor: COLORS.blue,
  },

  selectedDayText: {
    color: COLORS.white,
    fontWeight: "bold",
  },

  todayDay: {
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },

  todayText: {
    color: COLORS.blue,
    fontWeight: "bold",
  },

  dotRow: {
    position: "absolute",
    bottom: 2,
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
  },

  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  cardSectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },

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

  upcomingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  upcomingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },

  seeAll: {
    color: COLORS.blue,
    fontWeight: "600",
    fontSize: 14,
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