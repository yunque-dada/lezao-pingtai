import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scratch-platform';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

export default connectDB;
