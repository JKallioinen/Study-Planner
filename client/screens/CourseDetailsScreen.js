import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import db from "../database/sqlite";

const PREVIEW_LIMIT = 4;

export default function CourseDetailsScreen({ route, navigation }) {
  const { course, color = "#2D7BEA", symbol = "•" } = route.params;
  const [tasks, setTasks] = useState([]);
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const [showAllExams, setShowAllExams] = useState(false);

  const loadTasks = useCallback(() => {
    // Match course names case-insensitively and ignore stored surrounding spaces.
    setTasks(
      db.getAllSync(
        "SELECT * FROM tasks WHERE LOWER(TRIM(course)) = LOWER(?) ORDER BY id ASC",
        [course]
      )
    );
  }, [course]);

  useEffect(() => {
    loadTasks();
    // Refresh the list when returning to this screen after another screen edits it.
    return navigation.addListener("focus", loadTasks);
  }, [loadTasks, navigation]);

  const toggleTaskCompletion = (task) => {
    const status = task.status === "Completed" ? "Pending" : "Completed";
    db.runSync("UPDATE tasks SET status = ? WHERE id = ?", [
      status,
      task.id,
    ]);
    // Keep the displayed list in sync without reloading every task.
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? { ...currentTask, status }
          : currentTask
      )
    );
  };

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;
  // An empty course has no progress rather than a division-by-zero result.
  const percentage =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);
  const assignments = tasks.filter(
    (task) => task.taskType !== "Exam"
  );
  const exams = tasks.filter(
    (task) => task.taskType === "Exam"
  );

  const renderTask = (task, isExam) => {
    const completed = task.status === "Completed";
    const importance = task.priority || "Not set";
    const priorityStyle =
      task.priority === "High"
        ? styles.highPriority
        : task.priority === "Medium"
        ? styles.mediumPriority
        : task.priority === "Low"
        ? styles.lowPriority
        : styles.unsetPriority;

    return (
      <View key={task.id} style={styles.taskRow}>
        <Pressable
          accessibilityLabel={`${completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed }}
          onPress={() => toggleTaskCompletion(task)}
          style={[
            styles.taskCheck,
            isExam && styles.examCheck,
            completed && styles.taskCheckCompleted,
          ]}
        >
          <Text style={styles.taskCheckText}>
            {completed ? "✓" : isExam ? "▦" : ""}
          </Text>
        </Pressable>

        <View style={styles.taskInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.taskTitle,
              completed && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
          <Text style={styles.taskDue}>
            {isExam ? (task.dueDate || "Date not set") : `Due ${task.dueDate || "Not set"}`}
          </Text>
        </View>

        <View style={[styles.priorityBadge, priorityStyle]}>
          <Text style={[styles.priorityText, priorityStyle]}>
            {importance}
          </Text>
        </View>
      </View>
    );
  };

  const renderSection = (title, items, expanded, setExpanded, isExam) => {
    // Keep long lists compact until the user chooses to expand them.
    const visibleItems = expanded
      ? items
      : items.slice(0, PREVIEW_LIMIT);

    return (
      <View style={styles.taskSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>{title}</Text>
          {items.length > PREVIEW_LIMIT ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(!expanded)}
            >
              <Text style={styles.seeAll}>
                {expanded ? "Show less" : "See all"}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {items.length === 0 ? (
          <Text style={styles.emptyText}>
            No {title.toLowerCase()} added.
          </Text>
        ) : (
          visibleItems.map((task) => renderTask(task, isExam))
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={styles.backRow}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text numberOfLines={1} style={styles.backTitle}>
          {course}
        </Text>
      </Pressable>

      <View style={styles.courseTitleRow}>
        <View style={[styles.courseIcon, { backgroundColor: color }]}>
          <Text style={styles.courseSymbol}>{symbol}</Text>
        </View>
        <Text style={styles.courseTitle}>{course}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{percentage}%</Text>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: color, width: `${percentage}%` },
              ]}
            />
          </View>
        </View>
        <Text style={styles.progressCount}>
          {completedTasks} / {tasks.length}
        </Text>
      </View>

      {renderSection(
        "Assignments",
        assignments,
        showAllAssignments,
        setShowAllAssignments,
        false
      )}
      {renderSection(
        "Exams",
        exams,
        showAllExams,
        setShowAllExams,
        true
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F8FA",
    flex: 1,
  },
  content: {
    paddingBottom: 28,
  },
  backRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backArrow: {
    color: "#111827",
    fontSize: 32,
    lineHeight: 36,
    marginRight: 16,
  },
  backTitle: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  courseTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 28,
    paddingHorizontal: 12,
  },
  courseIcon: {
    alignItems: "center",
    borderRadius: 28,
    height: 54,
    justifyContent: "center",
    marginRight: 12,
    width: 54,
  },
  courseSymbol: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  courseTitle: {
    color: "#172033",
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
  },
  progressSection: {
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  progressHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "500",
  },
  progressPercentage: {
    color: "#172033",
    fontSize: 14,
  },
  progressRow: {
    flexDirection: "row",
  },
  progressBackground: {
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    flex: 1,
    height: 12,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 4,
    height: "100%",
  },
  progressCount: {
    color: "#68778D",
    fontSize: 12,
    marginTop: 4,
  },
  taskSection: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeading: {
    color: "#172033",
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: "#2D7BEA",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    color: "#68778D",
    fontSize: 13,
    paddingVertical: 6,
  },
  taskRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 12,
  },
  taskCheck: {
    alignItems: "center",
    borderColor: "#18212F",
    borderRadius: 5,
    borderWidth: 1,
    height: 19,
    justifyContent: "center",
    marginRight: 13,
    width: 19,
  },
  examCheck: {
    borderColor: "#2D7BEA",
    borderRadius: 4,
    borderWidth: 0,
    backgroundColor: "#2D7BEA",
    height: 34,
    width: 34,
  },
  taskCheckCompleted: {
    backgroundColor: "#2D7BEA",
    borderColor: "#2D7BEA",
  },
  taskCheckText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: "#202938",
    fontSize: 14,
  },
  taskTitleCompleted: {
    color: "#68778D",
  },
  taskDue: {
    color: "#68778D",
    fontSize: 12,
    marginTop: 3,
  },
  priorityBadge: {
    borderRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  priorityText: {
    fontSize: 11,
  },
  highPriority: {
    backgroundColor: "#FDE2E2",
    color: "#C63F48",
  },
  mediumPriority: {
    backgroundColor: "#FFF2D6",
    color: "#AA7000",
  },
  lowPriority: {
    backgroundColor: "#E0F5E9",
    color: "#168043",
  },
  unsetPriority: {
    backgroundColor: "#EDF1F5",
    color: "#68778D",
  },
});
