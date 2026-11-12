const { query, withTransaction } = require("../config/db.config");

// Find user by email
exports.findUserByEmail = async (email) => {
  const users = await query(
    `SELECT id, email
     FROM users
     WHERE LOWER(email) = ?
     LIMIT 1`,
    [email]
  );

  return users[0] || null;
};

// Invalidate previous unused reset tokens
exports.invalidatePreviousTokens = async (userId) => {
  return await query(
    `UPDATE password_reset_tokens
     SET used_at = NOW()
     WHERE user_id = ? AND used_at IS NULL`,
    [userId]
  );
};

// Create password reset token
exports.createResetToken = async (userId, tokenHash) => {
  return await query(
    `INSERT INTO password_reset_tokens
     (user_id, token_hash, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
    [userId, tokenHash]
  );
};

// Find valid reset token
exports.findValidResetToken = async (tokenHash) => {
  const tokens = await query(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = ?
       AND expires_at > NOW()
       AND used_at IS NULL
     LIMIT 1`,
    [tokenHash]
  );

  return tokens[0] || null;
};

// Mark reset token as used
// exports.consumeResetToken = async (tokenId) => {
//   const [result] = await query(
//     `UPDATE password_reset_tokens
//      SET used_at = NOW()
//      WHERE id = ?
//        AND used_at IS NULL
//        AND expires_at > NOW()`,
//     [tokenId]
//   );

//   return result.affectedRows === 1;
// };

// Update user password
// exports.updateUserPassword = async (userId, hashedPassword) => {
//   return await query(
//     `UPDATE users
//      SET password = ?
//      WHERE id = ?`,
//     [hashedPassword, userId]
//   );
// };

// Atomically consume token and update password
exports.resetPasswordWithToken = async (tokenId, userId, passwordHash) => {
  return withTransaction(async (connection) => {
    const [tokenResult] = await connection.execute(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = ?
         AND user_id = ?
         AND used_at IS NULL
         AND expires_at > NOW()`,
      [tokenId, userId]
    );

    if (tokenResult.affectedRows !== 1) {
      return false;
    }

    const [passwordResult] = await connection.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [passwordHash, userId]
    );

    if (passwordResult.affectedRows !== 1) {
      throw new Error("User password update failed.");
    }

    // Invalidate any other unused reset tokens for this user.
    await connection.execute(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = ?
         AND used_at IS NULL`,
      [userId]
    );

    return true;
  });
}