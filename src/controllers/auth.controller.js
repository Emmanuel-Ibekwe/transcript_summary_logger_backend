const { createUser, signInUser } = require("../services/auth.js");
const RefreshToken = require("../models/refreshTokenSchema.js");
const { sendEmail } = require("../utils/sendEmail.js");
const PasswordResetCode = require("../models/passwordResetCode.js");
const { generateToken, verifyToken } = require("../services/token.js");
const { getRandomSixDigits } = require("../utils/auth.js");
const { isPasswordInvalid } = require("../utils/validation");
const bcryptjs = require("bcryptjs");
const createHttpError = require("http-errors");

const User = require("../models/user.model.js");

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await createUser({
      name,
      email,
      password,
    });

    const accessToken = await generateToken(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = await generateToken(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);

    const storedToken = new RefreshToken({
      token: refreshToken,
      userId: newUser._id.toString(),
      expiresAt: futureDate,
    });

    await storedToken.save();
    console.log(storedToken);
    try {
      await sendEmail({
        code: null,
        to: newUser.email,
        subject: "Account Sign up",
        name: newUser.name.split(" ")[0],
        type: "sign up",
      });
    } catch (error) {
      await User.findByIdAndDelete(newUser._id.toString());
      throw new Error("Error sending email");
    }

    res.status(201).json({
      success: true,
      message: "sign up successful",
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await signInUser({ email, password });
    const accessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "30d",
      process.env.REFRESH_TOKEN_SECRET
    );

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + 30);

    const storedRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: user._id.toString(),
      expiresAt: futureDate,
    });

    await storedRefreshToken.save();

    res.status(201).json({
      success: true,
      message: "login successful",
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const token = await RefreshToken.findOne({ token: refreshToken });
    if (token) {
      result = await RefreshToken.findByIdAndDelete(token._id);
    }
    res.sendStatus(204);
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createHttpError.Unauthorized("Not authorized.");
    }

    let payload;
    try {
      payload = await verifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      console.log("Invalid or expired refresh token", error);
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token", success: false });
    }

    const user = await User.findById(payload.userId);
    const retrievedRefreshToken = await RefreshToken.findOne({
      token: refreshToken,
    });
    console.log(retrievedRefreshToken);
    if (
      !user ||
      !retrievedRefreshToken ||
      retrievedRefreshToken.userId.toString() !== user._id.toString()
    ) {
      throw createHttpError.Unauthorized("User not authorized.");
    }

    const accessToken = await generateToken(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      "1d",
      process.env.ACCESS_TOKEN_SECRET
    );

    res.status(200).json({ accessToken, success: true });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const sendResetPasswordEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError.BadRequest("Email not provided.");
    }

    // Create a new Date object
    let currentDate = new Date();

    // Set the date to two hours from now
    currentDate.setHours(currentDate.getHours() + 2);

    const user = await User.findOne({ email: email });

    if (!user) {
      throw createHttpError.NotFound("User does not exist.");
    }

    const randomCode = getRandomSixDigits();
    await PasswordResetCode.deleteMany({
      userId: user._id.toString(),
    });

    const code = await PasswordResetCode.create({
      userId: user._id,
      code: randomCode,
      expiresAt: currentDate,
    });

    await sendEmail({
      code: code.code,
      to: user.email,
      subject: "Reset Password",
      name: user.name.split(" ")[0],
      type: "reset password",
    });

    res.status(200).json({
      resetCodeId: code._id.toString(),
      message: "Password reset email sent successfully.",
      success: true,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const validateResetCode = async (req, res, next) => {
  try {
    const { resetCodeId, email } = req.body;
    const resetCode = parseInt(req.body.resetCode);

    if (!email) {
      throw createHttpError.BadRequest("Email not provided.");
    }

    if (!resetCode) {
      throw createHttpError.BadRequest("Reset code not provided.");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      throw createHttpError.NotFound("Email does not exist.");
    }

    const retrievedResetCode = await PasswordResetCode.findById(resetCodeId);
    if (!retrievedResetCode) {
      throw createHttpError.Gone(
        "Reset code no longer valid. Generate new one."
      );
    }

    if (
      retrievedResetCode.userId.toString() !== user._id.toString() &&
      retrievedResetCode.code !== resetCode
    ) {
      throw createHttpError.Forbidden(
        "You are not authorized to use this reset code."
      );
    }

    res.status(200).json({
      message: "Reset code valid.",
      resetCodeId: retrievedResetCode._id.toString(),
      email: email,
      success: true,
    });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword, email, resetCodeId } = req.body;

    if (!newPassword || !confirmPassword || !email || !resetCodeId) {
      throw createHttpError.BadRequest("Fill all fields.");
    }

    if (newPassword !== confirmPassword) {
      throw createHttpError.BadRequest("Passwords do not match.");
    }

    const user = await User.findOne({ email: email });
    const retrievedResetCode = await PasswordResetCode.findById(resetCodeId);

    if (isPasswordInvalid(newPassword)) {
      throw createHttpError.BadRequest(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    // Always perform a password comparison, even if the user doesn't exist
    const passwordToCompare = user
      ? user.password
      : "$2a$12$dummyHashToPreventTimingAttack"; // A dummy bcrypt hash
    const doesPasswordMatch = await bcryptjs.compare(
      newPassword,
      passwordToCompare
    );

    if (!user) {
      // Return a generic error (don't reveal if the user exists or not)
      throw createHttpError.BadRequest("Invalid request.");
    }

    if (retrievedResetCode.userId.toString() !== user._id.toString()) {
      throw createHttpError.Forbidden(
        "You are not authorized to use this reset code."
      );
    }

    if (doesPasswordMatch) {
      throw createHttpError.BadRequest(
        "New password cannot be same as old password."
      );
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 12);
    user.password = hashedPassword;

    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful", success: true });
  } catch (error) {
    if (!error.status) {
      error.status = 500;
    }
    error.success = false;
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  sendResetPasswordEmail,
  validateResetCode,
  resetPassword,
};
