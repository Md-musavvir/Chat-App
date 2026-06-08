import { performance } from "perf_hooks";

import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import redisClient from "./redisClient.js";

const generateTokens = async (id) => {
  const user = await User.findById(id);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All details are required");
  }

  const emailTrimmed = email.trim().toLowerCase();
  const usernameTrimmed = username.trim();
  if (username === "AI_buddy") {
    throw new ApiError(409, "you are not allowed to take this username");
  }

  const existingUser = await User.findOne({
    $or: [{ email: emailTrimmed }, { username: usernameTrimmed }],
  });

  if (existingUser) {
    if (existingUser.email === emailTrimmed) {
      throw new ApiError(409, "Email already in use");
    }
    if (existingUser.username === usernameTrimmed) {
      throw new ApiError(409, "Username already taken");
    }
  }

  const user = await User.create({
    username: usernameTrimmed,
    email: emailTrimmed,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});
const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Credentials are required");
  }
  const emailTrimmed = email.trim().toLowerCase();
  const passwordTrimmed = password.trim();

  const user = await User.findOne({ email: emailTrimmed });
  if (!user) {
    throw new ApiError(404, "user does not  exist");
  }
  if (user._id === "AI_BUDDY") {
    throw new ApiError(403, "AI cannot login");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(passwordTrimmed);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect password");
  }
  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in user");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedin succesfully",
      ),
    );
});
const logoutUser = AsyncHandler(async (req, res) => {
  console.log("out");

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getUser = AsyncHandler(async (req, res) => {
  const keyword = req.query.search?.trim();
  const st = performance.now();

  if (!keyword) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No search keyword provided"));
  }

  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cacheKey = `user-search:${req.user._id}:${keyword.toLowerCase()}`;
  const rateLimitKey = `search-${req.user._id}`;
  const currentCount = await redisClient.incr(rateLimitKey);
  if (currentCount === 1) {
    await redisClient.expire(rateLimitKey, 60);
  }
  if (currentCount > 6) {
    throw new ApiError(429, "limit exceeded");
  }

  const cachedUser = await redisClient.get(cacheKey);
  if (cachedUser) {
    console.log("cache hit");
    const e = performance.now();
    console.log(e - st);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          JSON.parse(cachedUser),
          "Users fetched successfully",
        ),
      );
  }
  console.log("cache miss");
  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { username: { $regex: escapedKeyword, $options: "i" } },
      { email: { $regex: escapedKeyword, $options: "i" } },
    ],
  }).select("-password -refreshToken");
  const end = performance.now();
  console.log(end - st);
  await redisClient.setEx(cacheKey, 300, JSON.stringify(users));

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { getUser, loginUser, logoutUser, registerUser };
