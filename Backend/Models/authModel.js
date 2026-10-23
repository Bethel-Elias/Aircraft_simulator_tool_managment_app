
const { query } = require("../config/db.config");

// Find a user by employee ID, including the password hash
async function findUserByEmployeeId(employeeId) {
  const users = await query(
    `SELECT id, employee_id, full_name, email,
            role, status, password_hash
     FROM users
     WHERE employee_id = ?
     LIMIT 1`,
    [employeeId]
  );

  return users[0] || null;
}

// Find a user by database ID
async function findUserById(id) {
  const users = await query(
    `SELECT id, employee_id, full_name, email, role, status
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return users[0] || null;
}

// Retrieve the user's password hash
async function findPasswordHashById(id) {
  const users = await query(
    `SELECT password_hash
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return users[0] || null;
}

// Update the user's password
async function updatePassword(id, passwordHash) {
  const result = await query(
    `UPDATE users
     SET password_hash = ?
     WHERE id = ?`,
    [passwordHash, id]
  );

  return result.affectedRows;
}

module.exports = {
  findUserByEmployeeId,
  findUserById,
  findPasswordHashById,
  updatePassword,
};
