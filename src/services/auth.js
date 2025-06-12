const createHttpError = require("http-errors");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const User = require("../models/user.model.js");
const { isPasswordInvalid } = require("../utils/validation.js");

const createUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Fill all fields.");
  }

  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Email is invalid");
  }

  const existingUser = await User.findOne({ email: email });

  if (existingUser) {
    throw createHttpError.Conflict("Email already exists. Try a new email.");
  }

  if (isPasswordInvalid(password)) {
    throw createHttpError.BadRequest(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  const hashedPassword = await bcryptjs.hash(password, 12);
  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  return user.save();
};

const signInUser = async (userData) => {
  const { email, password } = userData;

  if (!email || !password) {
    throw createHttpError.BadRequest("Please fill all the fields.");
  }

  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("invalid email.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  console.log(user);

  if (!user) {
    throw createHttpError.NotFound("User with this email could not found.");
  }

  const doesPasswordMatch = await bcryptjs.compare(password, user.password);

  if (!doesPasswordMatch) {
    throw createHttpError.Unauthorized("wrong password.");
  }

  return user;
};

module.exports = {
  createUser,
  signInUser,
};
