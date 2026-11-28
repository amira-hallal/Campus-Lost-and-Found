import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "../errors/ApiError.js";
import { nextId } from "../models/Counter.js";
import { User } from "../models/User.js";

function makeToken(userId) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new ApiError(500, "SERVER_CONFIG_ERROR", "JWT_SECRET is not set.");
  }

  return jwt.sign({ id: userId }, secret, { expiresIn: "1h" });
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    role: user.role,
    joinedAt: user.joinedAt,
  };
}

export async function register(req, res) {
  const { name, email, password, studentId = "" } = req.body ?? {};

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanName || !cleanEmail || typeof password !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "Name, email, and password are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Enter a valid email address.");
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Password must have at least 8 characters, a letter, and a number.");
  }

  const existingUser = await User.findOne({ email: cleanEmail });

  if (existingUser) {
    throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    id: await nextId(User.modelName),
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    studentId,
    role: "student",
    joinedAt: new Date().toISOString().slice(0, 10),
  });

  res.status(201).json({
    data: {
      user: safeUser(user),
      token: makeToken(user.id),
    },
  });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!cleanEmail || typeof password !== "string" || !password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Email and password are required.");
  }

  const user = await User.findOne({ email: cleanEmail }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  res.json({
    data: {
      user: safeUser(user),
      token: makeToken(user.id),
    },
  });
}