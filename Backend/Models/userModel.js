const { query } = require("../config/db.config");

const publicFields = `
  id, employee_id, full_name, email, role, status
`;

// GET /users?page=1&limit=20
async function findAll(limit, offset) {
  const [count] = await query("SELECT COUNT(*) AS total FROM users");

  const users = await query(
    `SELECT ${publicFields}
     FROM users
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return {
    users,
    total: Number(count.total),
  };
}

// GET /users/:id
async function findById(id) {
  const users = await query(
    `SELECT ${publicFields}
     FROM users
     WHERE id = ?`,
    [id]
  );

  return users[0] || null;
}

// POST /users
async function create({
  employee_id,
  full_name,
  email,
  password_hash,
  role,
  status,
}) {
  const result = await query(
    `INSERT INTO users
      (employee_id, full_name, email, password_hash, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [employee_id, full_name, email, password_hash, role, status]
  );

  return findById(result.insertId);
}

// PUT /users/:id
async function update(
  id,
  { employee_id, full_name, email, role, status, password_hash }
) {
  if (password_hash !== undefined) {
    await query(
      `UPDATE users
       SET employee_id = ?,
           full_name = ?,
           email = ?,
           role = ?,
           status = ?,
           password_hash = ?
       WHERE id = ?`,
      [employee_id, full_name, email, role, status, password_hash, id]
    );
  } else {
    await query(
      `UPDATE users
       SET employee_id = ?,
           full_name = ?,
           email = ?,
           role = ?,
           status = ?
       WHERE id = ?`,
      [employee_id, full_name, email, role, status, id]
    );
  }

  return findById(id);
}

// DELETE /users/:id — soft delete
async function deactivate(id) {
  const result = await query(
    `UPDATE users
     SET status = 'INACTIVE'
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
}

// PATCH /users/:id/status
async function updateStatus(id, status) {
  const result = await query(
    `UPDATE users
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deactivate,
  updateStatus,
};
