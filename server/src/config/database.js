import mongoose from 'mongoose';
import { config } from './environment.js';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      autoIndex: true,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};
