import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: {
    id: String,
    firstName: String,
    lastName: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedBy: {
    id: String,
    firstName: String,
    lastName: String
  },
  updatedAt: Date,
  isNew: { type: Boolean, default: true },
  isUpdated: { type: Boolean, default: false }
});

const productSchema = new mongoose.Schema({
  owner: String,
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  createdBy: {
    id: String,
    firstName: String,
    lastName: String
  },
  createdAt: { type: Date, default: Date.now },
  lastEditedBy: {
    id: String,
    firstName: String,
    lastName: String
  },
  lastEditedAt: Date,
  notes: [noteSchema]
});

if (!process.env.MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached: MongooseConnection = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10
    };

    console.log('Initializing MongoDB connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Successfully connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
  }

  try {
    console.log('Waiting for MongoDB connection...');
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
  } catch (error) {
    console.error('Failed to establish MongoDB connection:', error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

declare global {
  var mongoose: MongooseConnection;
}

export default connectDB;
