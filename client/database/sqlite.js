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
  status TEXT
);
`);

export default db;