
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const passwordResetModel = require("../Models/passwordResetModel");
const { sendPasswordResetEmail } = require("../Utils/email");

// POST /auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const genericMessage =
    "If an account exists with this email, a password reset link will be sent.";

  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await passwordResetModel.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Hash token before storing
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Invalidate previous tokens
    await passwordResetModel.invalidatePreviousTokens(user.id);

    // Store new token
    await passwordResetModel.createResetToken(user.id, tokenHash);

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL is not configured.");
    }

    const resetUrl = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail(user.email, resetUrl);

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again later.",
    });
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid reset token and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Password is too long.",
      });
    }

    // Hash submitted token
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const resetRecord = await passwordResetModel.findValidResetToken(tokenHash);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 8);

    // Update password and consume token in one transaction
    const updated = await passwordResetModel.resetPasswordWithToken(
      resetRecord.id,
      resetRecord.user_id,
      passwordHash
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};
