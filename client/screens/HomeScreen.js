import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";

import db from "../database/sqlite";

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  const loadTasks = () => {
    const data = db.getAllSync(
      "SELECT * FROM tasks ORDER BY id DESC"
    );

    setTasks(data);
  };

  const deleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            db.runSync(
              "DELETE FROM tasks WHERE id=?",
              [id]
            );

            loadTasks();
          },
        },
      ]
    );
  };

  useEffect(() => {
    const unsubscribe =
      navigation.addListener("focus", () => {
        loadTasks();
      });

    return unsubscribe;
  }, [navigation]);

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Study Planner
      </Text>

      <Text style={styles.subtitle}>
        Stay organized and meet your deadlines.
      </Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>
          Progress Overview
        </Text>

        <Text>Total Tasks: {tasks.length}</Text>

        <Text>
          Pending Tasks: {pendingTasks}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>
        My Tasks
      </Text>

      {tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No Tasks Yet
          </Text>

          <Text style={styles.emptyText}>
            Click + to create your first task.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.taskTitle}>
                {item.title}
              </Text>

              <Text style={styles.course}>
                📚 {item.course}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.date}>
                  📅 {item.dueDate}
                </Text>

                <Text
                  style={[
                    styles.priority,
                    item.priority === "High"
                      ? styles.high
                      : item.priority === "Medium"
                      ? styles.medium
                      : styles.low,
                  ]}
                >
                  🔥 {item.priority}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    navigation.navigate(
                      "EditTask",
                      { task: item }
                    )
                  }
                >
                  <Text style={styles.actionText}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() =>
                    deleteTask(item.id)
                  }
                >
                  <Text style={styles.actionText}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

   
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 20,
  },

  logo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    color: "gray",
    marginBottom: 20,
  },

  statsCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
  },

  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 10,
    color: "gray",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 4,
  },

  taskTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  course: {
    color: "#4285F4",
    fontWeight: "600",
    marginBottom: 8,
  },

  description: {
    color: "#555",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  date: {
    color: "#666",
  },

  priority: {
    fontWeight: "bold",
  },

  high: {
    color: "#E74C3C",
  },

  medium: {
    color: "#F39C12",
  },

  low: {
    color: "#27AE60",
  },

  statusBadge: {
    backgroundColor: "#E8F5E9",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  statusText: {
    color: "#27AE60",
    fontWeight: "bold",
  },

  actionRow: {
    flexDirection: "row",
  },

  editButton: {
    backgroundColor: "#3498DB",
    flex: 1,
    padding: 10,
    borderRadius: 8,
    marginRight: 5,
  },

  deleteButton: {
    backgroundColor: "#E74C3C",
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },

  actionText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4285F4",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
});