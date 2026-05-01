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
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      },
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new ApiError(500, "No response from AI");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { reply }, "AI response generated"));
  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);

    if (error.response?.status === 429) {
      throw new ApiError(503, "AI service rate limit reached, try again later");
    }

    throw new ApiError(500, "AI service failed");
  }
});
