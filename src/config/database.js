import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected ${connectionInstance.connection.host}`);

    } catch (error) {
        console.error("MongoDB connection failed", error);
        throw error;
    }
}

export default connectDB;