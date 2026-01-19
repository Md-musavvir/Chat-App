import dotenv from 'dotenv';

import app from './app.js';
import connectDb from './db/dbConnection.js';

dotenv.config();
connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Listening");
    });
  })
  .catch((error) => {
    console.log(error);
  });
