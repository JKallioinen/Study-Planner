const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Study Planner API Running");
});

const PORT = process.env.PORT || 3000;


app.get("/tasks", (req, res) => {
  db.all(
    "SELECT * FROM tasks",
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(rows);
    }
  );
});


app.post("/tasks", (req, res) => {
  const {
    title,
    course,
    description,
    dueDate,
    priority,
    status,
  } = req.body;

  db.run(
    `
    INSERT INTO tasks
    (title, course, description, dueDate, priority, status)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      course,
      description,
      dueDate,
      priority,
      status,
    ],
    function (err) {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        id: this.lastID,
        message: "Task Created",
      });
    }
  );
});

app.put("/tasks/:id", (req, res) => {
  const id = req.params.id;

  const {
    title,
    course,
    description,
    dueDate,
    priority,
    status,
  } = req.body;

  db.run(
    `
    UPDATE tasks
    SET
    title=?,
    course=?,
    description=?,
    dueDate=?,
    priority=?,
    status=?
    WHERE id=?
    `,
    [
      title,
      course,
      description,
      dueDate,
      priority,
      status,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Task Updated",
      });
    }
  );
});

app.delete("/tasks/:id", (req, res) => {
  const id = req.params.id;

  db.run(
    "DELETE FROM tasks WHERE id=?",
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Task Deleted",
      });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});