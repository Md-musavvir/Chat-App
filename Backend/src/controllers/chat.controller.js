import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const accessChat = AsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "Receiver id is required");
  }

  if (userId && userId.toString().toUpperCase() === "AI_BUDDY") {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          _id: "AI_CHAT",
          chatName: "Ai_buddy",
          isGroupChat: false,
          isAIChat: true,
          users: [
            req.user,
            {
              _id: "AI_BUDDY",
              username: "Ai_buddy",
              email: "ai@bot.com",
              isAI: true,
            },
          ],
          latestMessage: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        "AI chat initialized",
      ),
    );
  }

  let existingChat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password");

  if (existingChat) {
    existingChat = await User.populate(existingChat, {
      path: "latestMessage.sender",
      select: "username email",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, existingChat, "Chat already exists"));
  }

  const createdChat = await Chat.create({
    chatName: null,
    isGroupChat: false,
    users: [req.user._id, userId],
  });

  let fullChat = await Chat.findById(createdChat._id)
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password");

  fullChat = await User.populate(fullChat, {
    path: "latestMessage.sender",
    select: "username email",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, fullChat, "Chat created successfully"));
});

const fetchChat = AsyncHandler(async (req, res) => {
  const userId = req.user._id;

  let chats = await Chat.find({ users: userId })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "username email",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "Chats fetched successfully"));
});

const createGroup = AsyncHandler(async (req, res) => {
  const { groupName, usersList } = req.body;

  if (!groupName || !usersList) {
    throw new ApiError(400, "Group name and users list are required");
  }

  let users;

  try {
    users = Array.isArray(usersList) ? usersList : JSON.parse(usersList);
  } catch {
    throw new ApiError(400, "Invalid users list format");
  }

  users.push(req.user._id);
  users = [...new Set(users.map((id) => id.toString()))];

  if (users.length < 2) {
    throw new ApiError(400, "Group must have at least 2 members");
  }

  const createdGroup = await Chat.create({
    chatName: groupName.trim(),
    isGroupChat: true,
    users,
    groupAdmin: req.user._id,
  });

  let fullGroup = await Chat.findById(createdGroup._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage");

  fullGroup = await User.populate(fullGroup, {
    path: "latestMessage.sender",
    select: "username email",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, fullGroup, "Group created successfully"));
});

const addToGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new ApiError(400, "chatId and userId are required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");
  if (!chat.isGroupChat)
    throw new ApiError(400, "Cannot add users to private chat");

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can add users");
  }

  if (chat.users.some((u) => u.toString() === userId.toString())) {
    throw new ApiError(400, "User already in group");
  }

  let updatedGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage");

  updatedGroup = await User.populate(updatedGroup, {
    path: "latestMessage.sender",
    select: "username email",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "User added successfully"));
});

const removeFromGroup = AsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    throw new ApiError(400, "chatId and userId are required");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) throw new ApiError(404, "Chat not found");
  if (!chat.isGroupChat)
    throw new ApiError(400, "Cannot remove users from private chat");

  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can remove users");
  }

  if (userId.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Admin cannot remove themselves");
  }

  let updatedGroup = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true },
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage");

  updatedGroup = await User.populate(updatedGroup, {
    path: "latestMessage.sender",
    select: "username email",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "User removed successfully"));
});

export { accessChat, addToGroup, createGroup, fetchChat, removeFromGroup };
