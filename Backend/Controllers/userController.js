const bcrypt = require("bcryptjs");
const User = require("../Models/userModel");

const roles = [
  "ADMIN",
  "MANAGER",
  "SUPERVISOR",
  "TOOL_CONTROLLER",
  "TECHNICIAN",
  "CALIBRATION_OFFICER",
  "QUALITY",
  "VIEWER",
];

const allowedStatuses = ["ACTIVE", "INACTIVE"];

function validateUser(body, creating = false) {
  const { employee_id, full_name, email, role, status, password } = body;

  if (
    creating &&
    (typeof employee_id !== "string" ||
      !employee_id.trim() ||
      typeof full_name !== "string" ||
      !full_name.trim() ||
      typeof password !== "string" ||
      !password)
  ) {
    return "Employee ID, full name, and password are required";
  }

  if (
    employee_id !== undefined &&
    (typeof employee_id !== "string" || !employee_id.trim())
  ) {
    return "Employee ID must be a non-empty string";
  }

  if (
    full_name !== undefined &&
    (typeof full_name !== "string" || !full_name.trim())
  ) {
    return "Full name must be a non-empty string";
  }

  if (
    email !== undefined &&
    email !== null &&
    (typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
  ) {
    return "A valid email address is required";
  }

  if (role !== undefined && !roles.includes(role)) {
    return "Invalid user role";
  }

  if (status !== undefined && !allowedStatuses.includes(status)) {
    return "Invalid user status";
  }

  if (
    password !== undefined &&
    (typeof password !== "string" || password.length < 12)
  ) {
    return "Password must be at least 12 characters";
  }

  return null;
}

function isDuplicate(error) {
  return error.code === "ER_DUP_ENTRY";
}

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// GET /users?page=1&limit=20
 async function listUsers (req, res) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100",
      });
    }

    const offset = (page - 1) * limit;
    const { users, total } = await User.findAll(limit, offset);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
    });
  }
};

// GET /users/:id
async function getUser (req, res) {
  try {
    const id = validId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);

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

// POST /users
async function createUser (req, res){
  try {
    const errorMessage = validateUser(req.body, true);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    const {
      employee_id,
      full_name,
      email = null,
      password,
      role = "TECHNICIAN",
      status = "ACTIVE",
    } = req.body;

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      employee_id: employee_id.trim(),
      full_name: full_name.trim(),
      email: email ? email.trim() : null,
      password_hash,
      role,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    console.error("Create user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create user",
    });
  }
};

// PUT /users/:id
async function updateUser (req, res) {
  try {
    const id = validId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const errorMessage = validateUser(req.body);

    if (errorMessage) {
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }

    const current = await User.findById(id);

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const body = req.body;

    const employee_id =
      body.employee_id !== undefined
        ? body.employee_id.trim()
        : current.employee_id;

    const full_name =
      body.full_name !== undefined ? body.full_name.trim() : current.full_name;

    const email =
      body.email !== undefined
        ? body.email === null
          ? null
          : body.email.trim()
        : current.email;

    const role = body.role ?? current.role;
    const status = body.status ?? current.status;

    // Prevent users from changing their own role or deactivating themselves.
    if (
      id === Number(req.user.id) &&
      (role !== req.user.role || status !== "ACTIVE")
    ) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role or deactivate yourself",
      });
    }

    const updateData = {
      employee_id,
      full_name,
      email,
      role,
      status,
    };

    // Allow password updates through this endpoint, if provided.
    if (body.password !== undefined) {
      updateData.password_hash = await bcrypt.hash(body.password, 12);
    }

    const updatedUser = await User.update(id, updateData);

    return res.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return res.status(409).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    console.error("Update user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
    });
  }
};

// DELETE /users/:id — soft delete
 async function deactivateUser (req, res) {
  try {
    const id = validId(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (id === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const exists = await User.findById(id);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.deactivate(id);

    return res.json({
      success: true,
      message: "User deactivated successfully",
      data: {
        id,
        status: "INACTIVE",
      },
    });
  } catch (error) {
    console.error("Deactivate user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to deactivate user",
    });
  }
};

// PATCH /users/:id/status
async function updateUserStatus(req, res) {
  try {
    const id = validId(req.params.id);
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be ACTIVE or INACTIVE",
      });
    }

    if (id === Number(req.user.id) && status === "INACTIVE") {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account",
      });
    }

    const exists = await User.findById(id);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.updateStatus(id, status);

    return res.json({
      success: true,
      message: "User status updated successfully",
      data: { id, status },
    });
  } catch (error) {
    console.error("Update status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update user status",
    });
  }
};

module.exports = {
    listUsers,
    getUser,
    createUser,
    updateUser,
    deactivateUser,
    updateUserStatus,
}