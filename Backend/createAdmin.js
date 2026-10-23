
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { query } = require("./config/db.config");

async function createAdmin() {
  try {
     const employeeId = process.env.ADMIN_EMPLOYEE_ID;
     const fullName = process.env.ADMIN_FULL_NAME;
     const email = process.env.ADMIN_EMAIL || null;
     const password = process.env.ADMIN_INITIAL_PASSWORD;

    // Check whether the administrator already exists
    const existing = await query(
      "SELECT id FROM users WHERE employee_id = ? OR email = ?",
      [employeeId, email]
    );

    if (existing.length > 0) {
      console.log("Administrator already exists. No account created.");
      return;
    }

    // Hash the password before saving it
    const passwordHash = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO users
       (employee_id, full_name, email, password_hash, role, status)
       VALUES (?, ?, ?, ?, 'ADMIN', 'ACTIVE')`,
      [employeeId, fullName, email, passwordHash]
    );

    console.log("Administrator created successfully.");
    console.log("Employee ID:", employeeId);
    console.log("Email:", email);
    console.log("Use the password configured in createAdmin.js to log in.");
  } catch (error) {
    console.error("Administrator setup failed:", error.message);
    process.exitCode = 1;
  }
}

createAdmin();
