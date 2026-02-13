import dotenv from "dotenv";

import app from "./app.js";
import connectDb from "./db/dbConnection.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express App Error:", error);
    });

    app.listen(PORT, () => {
      console.log(`✅ Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed!", error);
  });
