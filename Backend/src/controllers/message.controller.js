import { Chat } from "../models/chat.models.js";
import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const sendMessage = AsyncHandler(async (req, res) => {
  const { chatId, content } = req.body;
  if (!chatId || !content) {
    throw new ApiError(400, "chatId and content is required");
  }
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };
  var message = await Message.create(newMessage);
  message = await message.populate("sender", "username");
  message = await message.populate("chat");
  message = await User.populate(message, {
    path: "chat.users",
    select: "username email",
  });
  if (!message) {
    throw new ApiError(500, "something went wrong while sending message");
  }
  const chat = await Chat.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
  });
  if (!chat) {
    throw new ApiError(500, "couldnt send message");
  }
  res
    .status(201)
    .json(new ApiResponse(201, message, "message sent successfully"));
});

const getAllMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "chatId is required to fetch messages");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username email")
    .populate("chat")
    .sort({ createdAt: 1 }); // oldest → newest

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export { getAllMessages, sendMessage };
