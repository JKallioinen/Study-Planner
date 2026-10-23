// Group member Nerov kha has created the SQLite database 
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
`);

const taskColumns = db.getAllSync("PRAGMA table_info(tasks)");
if (!taskColumns.some((column) => column.name === "taskType")) {
  db.execSync(
    "ALTER TABLE tasks ADD COLUMN taskType TEXT NOT NULL DEFAULT 'Assignment'"
  );
}

export default db;