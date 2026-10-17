import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("tasks.db");

db.execSync(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  course TEXT,
  description TEXT,
  dueDate TEXT,
  priority TEXT,
  status TEXT,
  taskType TEXT NOT NULL DEFAULT 'Assignment'
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL COLLATE NOCASE UNIQUE
);
`);

const taskColumns = db.getAllSync("PRAGMA table_info(tasks)");
if (!taskColumns.some((column) => column.name === "taskType")) {
  db.execSync(
    "ALTER TABLE tasks ADD COLUMN taskType TEXT NOT NULL DEFAULT 'Assignment'"
  );
}

db.runSync(`
  INSERT OR IGNORE INTO courses (name)
  SELECT DISTINCT TRIM(course)
  FROM tasks
  WHERE course IS NOT NULL AND TRIM(course) <> ''
`);

export function saveCourse(name) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return null;
  }

  const result = db.runSync(
    "INSERT OR IGNORE INTO courses (name) VALUES (?)",
    [trimmedName]
  );
  const course = db.getFirstSync(
    "SELECT name FROM courses WHERE name = ? COLLATE NOCASE",
    [trimmedName]
  );

  return {
    name: course.name,
    created: result.changes > 0,
  };
}

export default db;