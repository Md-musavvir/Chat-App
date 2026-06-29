import {
  setServers,
} from 'node:dns/promises'; 
import mongoose from 'mongoose';

import DB_NAME from '../constants.js';

const connectDb = async () => {
  try {
    
    setServers(["8.8.8.8", "1.1.1.1"]);

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );

    console.log(
      `Database connected successfully: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`Database connection failed: ${error}`);
    process.exit(1);
  }
};

export default connectDb;
