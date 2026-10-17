import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import db from "../database/sqlite";

const courseColors = ["#2D7BEA", "#8754EB", "#F19A00", "#20B660"];
const courseSymbols = ["</>", "~", "≡", "◎"];

export default function ProgressScreen({ navigation }) {
  const [courses, setCourses] = useState([]);

  const loadCourses = useCallback(() => {
    setCourses(
      db.getAllSync(`
        SELECT
          courses.id,
          courses.name,
          COUNT(tasks.id) AS total,
          SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END) AS completed
        FROM courses
        LEFT JOIN tasks
          ON LOWER(TRIM(tasks.course)) = LOWER(courses.name)
        GROUP BY courses.id, courses.name
        ORDER BY courses.id
      `)
    );
  }, []);

  useEffect(() => {
    loadCourses();
    return navigation.addListener("focus", loadCourses);
  }, [loadCourses, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>My Courses</Text>

      {courses.length === 0 ? (
        <Text style={styles.emptyText}>
          Add a course to start tracking your progress.
        </Text>
      ) : (
        courses.map((course, index) => {
          const percentage =
            course.total === 0
              ? 0
              : Math.round((course.completed / course.total) * 100);
          const color = courseColors[index % courseColors.length];

          return (
            <Pressable
              key={course.id}
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate("CourseDetails", {
                  course: course.name,
                  courseId: course.id,
                  color,
                  symbol: courseSymbols[index % courseSymbols.length],
                })
              }
              style={({ pressed }) => [
                styles.courseCard,
                pressed && styles.courseCardPressed,
              ]}
            >
              <View style={styles.courseTopRow}>
                <View style={[styles.courseIcon, { backgroundColor: color }]}>
                  <Text style={styles.courseSymbol}>
                    {courseSymbols[index % courseSymbols.length]}
                  </Text>
                </View>

                <View style={styles.courseInfo}>
                  <Text numberOfLines={1} style={styles.courseName}>
                    {course.name}
                  </Text>
                  <Text style={styles.detail}>
                    {course.completed} / {course.total} tasks completed
                  </Text>
                </View>

                <Text style={styles.chevron}>›</Text>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: color,
                        width: `${percentage}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.coursePercentage, { color }]}>
                  {percentage}%
                </Text>
              </View>
            </Pressable>
          );
        })
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("AddCourse")}
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
      >
        <Text style={styles.addButtonText}>＋ Add course</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  heading: {
    color: "#172033",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 66,
  },
  emptyText: {
    color: "#68778D",
    fontSize: 14,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 1,
    marginBottom: 14,
    padding: 12,
  },
  courseCardPressed: {
    opacity: 0.8,
  },
  courseTopRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  courseIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    marginRight: 9,
    width: 40,
  },
  courseSymbol: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "600",
  },
  detail: {
    color: "#68778D",
    fontSize: 12,
    marginTop: 5,
  },
  chevron: {
    color: "#63748B",
    fontSize: 28,
    lineHeight: 30,
    marginLeft: 12,
    paddingHorizontal: 5,
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 8,
    marginTop: 10,
  },
  progressBackground: {
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    flex: 1,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    borderRadius: 4,
    height: "100%",
  },
  coursePercentage: {
    fontSize: 12,
    marginLeft: 16,
    textAlign: "center",
    width: 42,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#2D7BEA",
    borderRadius: 12,
    marginTop: 2,
    paddingVertical: 15,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
