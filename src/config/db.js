import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fallbackDbPath = path.join(__dirname, '../../db_fallback.json');

/* ---------------------------
   STATE TRACKING (IMPORTANT)
----------------------------*/
let isConnected = false;
let connectionAttempted = false;

/* ---------------------------
   INIT FALLBACK DB
----------------------------*/
const initFallbackDb = () => {
  try {
    if (fs.existsSync(fallbackDbPath)) return;

    const initialData = {
      books: [],
      users: [],
      orders: []
    };

    fs.writeFileSync(
      fallbackDbPath,
      JSON.stringify(initialData, null, 2),
      'utf-8'
    );

    console.log('📂 Fallback DB ready');
  } catch (err) {
    console.error('❌ Fallback DB init failed:', err.message);
  }
};

/* ---------------------------
   MONGODB CONNECT
----------------------------*/
const connectMongo = async (uri) => {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10
  });
};

/* ---------------------------
   MAIN DB CONNECTION
----------------------------*/
export const connectDB = async () => {
  initFallbackDb();

  // prevent multiple connection attempts (VERY IMPORTANT in dev watch mode)
  if (connectionAttempted && isConnected) {
    console.log('🔌 DB already connected');
    return;
  }

  connectionAttempted = true;

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn('⚠️ MongoDB URI missing → Using fallback DB');
    process.env.USE_MOCK_DB = 'true';
    return;
  }

  try {
    await connectMongo(mongoUri);

    isConnected = true;
    process.env.USE_MOCK_DB = 'false';

    console.log('🔌 MongoDB connected');
    return;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }

  // retry once only (clean + controlled)
  try {
    console.log('🔁 Retrying MongoDB connection...');

    await connectMongo(mongoUri);

    isConnected = true;
    process.env.USE_MOCK_DB = 'false';

    console.log('🔌 MongoDB connected (retry success)');
    return;
  } catch (err) {
    console.error('❌ Retry failed:', err.message);
  }

  console.warn('📂 Switching to JSON fallback DB');
  process.env.USE_MOCK_DB = 'true';
};

/* ---------------------------
   FALLBACK DB HELPERS
----------------------------*/
export const readFallbackData = () => {
  try {
    return JSON.parse(fs.readFileSync(fallbackDbPath, 'utf-8'));
  } catch (err) {
    console.error('❌ Read fallback error:', err.message);
    return { books: [], users: [], orders: [] };
  }
};

export const writeFallbackData = (data) => {
  try {
    fs.writeFileSync(
      fallbackDbPath,
      JSON.stringify(data, null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('❌ Write fallback error:', err.message);
  }
};