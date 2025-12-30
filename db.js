const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0808",
  database: "complaint_system"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("Connected to MySQL database ✅");
  }
});

module.exports = db;
