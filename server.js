const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use("/css", express.static(path.join(__dirname, "css")));

/* ---------- MySQL Connection ---------- */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0808",       // your mysql password
  database: "complaints_db"
});

db.connect(err => {
  if (err) {
    console.error("DB error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ---------- CLIENT: Submit Complaint ---------- */
app.post("/api/complaint", (req, res) => {
  const { emp_id, problem } = req.body;

  if (!emp_id || !problem) {
    return res.status(400).send("Missing fields");
  }

  const sql =
    "INSERT INTO complaints (emp_id, problem, status) VALUES (?, ?, 'Open')";

  db.query(sql, [emp_id, problem], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB Insert Error");
    }
    res.sendStatus(200);
  });
});

/* ---------- ADMIN: Get All Complaints ---------- */
app.get("/api/complaints", (req, res) => {
  const sql = "SELECT * FROM complaints ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("DB Fetch Error");
    }
    res.json(results);
  });
});

/* ---------- ADMIN: Update Status ---------- */
app.put("/api/complaint/:id", (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const sql = "UPDATE complaints SET status=? WHERE complaint_id=?";

  db.query(sql, [status, id], err => {
    if (err) {
      console.error(err);
      return res.status(500).send("Update Error");
    }
    res.sendStatus(200);
  });
});

/* ---------- Pages ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
