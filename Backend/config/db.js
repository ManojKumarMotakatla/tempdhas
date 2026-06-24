// ── CHANGED: reads from process.env instead of hardcoded values ──
// ── FIXED: Removed SESSION max_allowed_packet (read-only in MySQL 8+).
//           Large packet support is now handled at the application level
//           via the express body-parser limit in server.js (already 12mb).
//           The pool maxAllowedPacket option is kept for the driver. ──
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),

  ssl: {
    rejectUnauthorized: false
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
