const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authModel = require("../Models/authModel");


// POST /auth/login
async function login(req, res){
  try {
    const { employee_id, password } = req.body;

    if (
      typeof employee_id !== "string" ||
      typeof password !== "string" ||
      !employee_id.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and password are required",
      });
    }

    const user = await authModel.findUserByEmployeeId(employee_id.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid employee ID or password",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    });

    // Never send the password hash to the frontend
    delete user.password_hash;

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
};

// GET /auth/me
async function me (req, res) {
  try {
    const user = await authModel.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user",
    });
  }
};

// POST /auth/logout
async function logout (req, res) {
  
  return res.json({
    success: true,
    message: "Logout successful",
    data: {},
  });
};

// POST /auth/change-password
async function changePassword (req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (
      typeof current_password !== "string" ||
      typeof new_password !== "string" ||
      !current_password ||
      !new_password
    ) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (new_password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 12 characters",
      });
    }

    const user = await authModel.findPasswordHashById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const matches = await bcrypt.compare(current_password, user.password_hash);

    if (!matches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (await bcrypt.compare(new_password, user.password_hash)) {
      return res.status(400).json({
        success: false,
        message: "Choose a different password",
      });
    }

    const newHash = await bcrypt.hash(new_password, 12);

    await authModel.updatePassword(req.user.id, newHash);

    return res.json({
      success: true,
      message: "Password changed successfully",
      data: {},
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};

module.exports = {
    login,
    me,
    logout,
    changePassword,
}