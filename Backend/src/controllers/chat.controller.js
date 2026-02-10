import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const accessChat = AsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "receiver id is required");
  }

  let isChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  if (isChat) {
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "username email",
    });

    return res.status(200).json(new ApiResponse(200, isChat, "here is chat"));
  }

  const createdChat = await Chat.create({
    chatName: "sender",
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  if (!createdChat) {
    throw new ApiError(400, "something went wrong while creating chat");
  }

  const fullChat = await Chat.findById(createdChat._id).populate(
    "users",
    "-password",
  );

  res
    .status(200)
    .json(new ApiResponse(200, fullChat, "created chat successfully"));
});
const fetchChat = AsyncHandler(async (req, res) => {
  const user_id = req.user._id;

  if (!user_id) {
    throw new ApiError(400, "user id is required to fetch chats");
  }

  let chats = await Chat.find({ users: user_id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "username email",
  });

  if (!chats || chats.length === 0) {
    throw new ApiError(404, "no chats exist");
  }

  res.status(200).json(new ApiResponse(200, chats, "here are your chats"));
});
const createGroup = AsyncHandler(async (req, res) => {
  const { groupName, usersList } = req.body;
  if (!groupName || !usersList) {
    throw new ApiError(400, " information is required");
  }
  let users;
  try {
    users = Array.isArray(usersList) ? usersList : JSON.parse(usersList);
  } catch {
    throw new ApiError(400, "invalid users list format");
  }

  users.push(req.user._id);
  if (users.length < 2) {
    throw new ApiError(400, "group should have atleast 2 members");
  }
  const createdGroup = await Chat.create({
    chatName: groupName,
    isGroupChat: true,
    users: users,
    groupAdmin: req.user._id,
  });
  const chat = await Chat.findById(createdGroup._id);
  if (!chat) {
    throw new ApiError(500, "something went wrong while creating group");
  }
  res
    .status(200)
    .json(new ApiResponse(200, { chat }, "group created successfully"));
});
const addToGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new ApiError(400, "chatId and userId are required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "chat not found");
  }

  if (!chat.isGroupChat) {
    throw new ApiError(400, "cannot add users to private chat");
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "only admin can add users");
  }

  const updatedGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "user added successfully"));
});
const removeFromGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new ApiError(400, "chatId and userId are required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "chat not found");
  }

  if (!chat.isGroupChat) {
    throw new ApiError(400, "cannot remove users from private chat");
  }

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "only admin can remove users");
  }

  if (userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "admin cannot remove themselves");
  }

  const updatedGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "user removed successfully"));
});

export { accessChat, addToGroup, createGroup, fetchChat, removeFromGroup };
