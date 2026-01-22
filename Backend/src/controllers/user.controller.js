import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

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
    throw new ApiError(400, "All fields are required");
  }

  const emailTrimmed = email.trim().toLowerCase();
  const usernameTrimmed = username.trim();

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
      new ApiResponse(200, { user: loggedInUser }, "User loggedin succesfully"),
    );
});

export { loginUser, registerUser };
