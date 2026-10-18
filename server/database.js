const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tasks.db");

db.run(`
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  course TEXT,
  description TEXT,
  dueDate TEXT,
  priority TEXT,
  status TEXT
)
`);

module.exports = db;