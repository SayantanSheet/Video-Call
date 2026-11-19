import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import { signToken } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";
import { normalizeUsername, requireString, validatePassword } from "../utils/validate.js";

const BCRYPT_ROUNDS = 10;

const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  username: user.username,
});

const register = asyncHandler(async (req, res) => {
  const name = requireString(req.body?.name, "Name", { min: 1, max: 64 });
  const username = normalizeUsername(req.body?.username);
  const password = validatePassword(req.body?.password);

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    // 409, not the original 302 FOUND — that sent a redirect status with no Location.
    throw new ApiError(409, "That username is already taken");
  }

  const user = await User.create({
    name,
    username,
    password: await bcrypt.hash(password, BCRYPT_ROUNDS),
  });

  // Sign the user in directly so registration doesn't require a second round trip.
  res.status(201).json({ token: signToken(user), user: toPublicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const password = requireString(req.body?.password, "Password", { max: 72 });

  const user = await User.findOne({ username }).select("+password");

  // One generic message for both "no such user" and "wrong password". The
  // original returned 404 vs 401 with different text, which let anyone probe
  // for valid usernames.
  const isPasswordCorrect = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !isPasswordCorrect) {
    throw new ApiError(401, "Invalid username or password");
  }

  res.json({ token: signToken(user), user: toPublicUser(user) });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(401, "Account no longer exists");
  }
  res.json({ user: toPublicUser(user) });
});

/** Identity comes from the verified token, never from the request. */
const getUserHistory = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({ user_id: req.user.id }).sort({ date: -1 }).limit(100);
  res.json(meetings);
});

const addToHistory = asyncHandler(async (req, res) => {
  const meetingCode = requireString(req.body?.meeting_code, "Meeting code", { max: 64 });

  const meeting = await Meeting.create({
    user_id: req.user.id,
    meetingCode,
  });

  res.status(201).json({ message: "Meeting added to history", meeting });
});

export { login, register, getCurrentUser, getUserHistory, addToHistory };
