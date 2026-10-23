const jwt = require("jsonwebtoken");
const {query} = require("../config/db.config");

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const users = await query(
      `SELECT id, employee_id, full_name, email, role, status
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0 || users[0].status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "User account not found or inactive",
      });
    }

    req.user = users[0];
    req.token = token;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

module.exports = authenticateToken;
