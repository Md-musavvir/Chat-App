import axios from "axios";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

export const chatWithAI = AsyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      },
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      throw new ApiError(500, "No response from AI");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { reply }, "AI response generated"));
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    throw new ApiError(500, "AI service failed");
  }
});
