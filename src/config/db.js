import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const fallbackDbPath = path.join(__dirname, '../../db_fallback.json');

// Helper to initialize fallback JSON DB if it doesn't exist
const initFallbackDb = () => {
  if (!fs.existsSync(fallbackDbPath)) {
    const initialData = {
      books: [
        {
          _id: "book_1",
          title: "The Alchemist",
          author: "Paulo Coelho",
          price: 1800,
          category: "Fiction",
          description: "A gorgeous fable about following your dreams. The Alchemist has established itself as a modern classic, universally admired.",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
          rating: 4.8,
          featured: true,
          stock: 12
        },
        {
          _id: "book_2",
          title: "Atomic Habits",
          author: "James Clear",
          price: 2400,
          category: "Business",
          description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies.",
          coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
          rating: 4.9,
          featured: true,
          stock: 25
        },
        {
          _id: "book_3",
          title: "Educated",
          author: "Tara Westover",
          price: 2100,
          category: "Education",
          description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
          coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
          rating: 4.7,
          featured: false,
          stock: 8
        },
        {
          _id: "book_4",
          title: "Thinking, Fast and Slow",
          author: "Daniel Kahneman",
          price: 2900,
          category: "Business",
          description: "Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind.",
          coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
          rating: 4.6,
          featured: true,
          stock: 15
        }
      ],
      users: [
        {
          _id: "user_admin",
          name: "Admin User",
          phoneNumber: "0766572148",
          role: "admin"
        }
      ],
      orders: []
    };
    fs.writeFileSync(fallbackDbPath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
};

export const connectDB = async () => {
  initFallbackDb();
  
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('⚠️  No MONGODB_URI found in environment variables.');
    console.log('📂  Using local JSON database fallback (db_fallback.json)...');
    process.env.USE_MOCK_DB = 'true';
    return;
  }

  const connectToMongo = async () => {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
  };

  try {
    // Set a short timeout for quick failover/fallback
    await connectToMongo();
    console.log('🔌  Connected to MongoDB successfully.');
    process.env.USE_MOCK_DB = 'false';
    return;
  } catch (error) {
    console.error('❌  MongoDB connection error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.message.includes('querySrv')) {
      const originalDnsServers = dns.getServers();
      const fallbackDns = ['8.8.8.8', '1.1.1.1'];
      dns.setServers(fallbackDns);
      console.log(`ℹ️  Retrying MongoDB connection using public DNS servers: ${fallbackDns.join(', ')}`);

      try {
        await connectToMongo();
        console.log('🔌  Connected to MongoDB successfully using public DNS fallback.');
        process.env.USE_MOCK_DB = 'false';
        return;
      } catch (retryError) {
        console.error('❌  MongoDB retry connection error:', retryError.message);
      } finally {
        dns.setServers(originalDnsServers);
      }
    }

    console.log('📂  Falling back to local JSON database (db_fallback.json)...');
    process.env.USE_MOCK_DB = 'true';
  }
};

// Helper methods to read/write JSON fallback DB
export const readFallbackData = () => {
  try {
    const data = fs.readFileSync(fallbackDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading JSON database:", e);
    return { books: [], users: [], orders: [] };
  }
};

export const writeFallbackData = (data) => {
  try {
    fs.writeFileSync(fallbackDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing JSON database:", e);
  }
};
