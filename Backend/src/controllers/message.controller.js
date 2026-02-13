import { Chat } from "../models/chat.models.js";
import { Message } from "../models/message.models.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const sendMessage = AsyncHandler(async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    throw new ApiError(400, "chatId and content are required");
  }

  // Ensure chat exists
  const chatExists = await Chat.findById(chatId);
  if (!chatExists) {
    throw new ApiError(404, "Chat not found");
  }

  // Create message
  let message = await Message.create({
    sender: req.user._id,
    content: content.trim(),
    chat: chatId,
  });

  // Populate sender only (frontend needs this)
  message = await message.populate("sender", "username email");

  // Update latestMessage AND force updatedAt refresh
  await Chat.findByIdAndUpdate(
    chatId,
    {
      latestMessage: message._id,
      $set: { updatedAt: new Date() },
    },
    { new: true },
  );

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

const getAllMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    throw new ApiError(400, "chatId is required");
  }

  const chatExists = await Chat.findById(chatId);
  if (!chatExists) {
    throw new ApiError(404, "Chat not found");
  }

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export { getAllMessages, sendMessage };
