import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Book from './models/Book.js';
import Order from './models/Order.js';

dotenv.config();

async function findBooks() {
  await connectDB();

  try {
    const orders = await Order.find();
    const books = await Book.find();

    console.log('--- Active Books currently in DB ---');
    books.forEach(b => console.log(`- ${b.title} (by ${b.author})`));

    console.log('\n--- Book Titles found in past Orders ---');
    const orderedTitles = new Set();
    orders.forEach(o => {
      if (o.items) {
        o.items.forEach(item => {
          orderedTitles.add(item.title);
        });
      }
    });

    orderedTitles.forEach(title => {
      const exists = books.some(b => b.title.toLowerCase() === title.toLowerCase());
      if (exists) {
        console.log(`[Exists] ${title}`);
      } else {
        console.log(`[DELETED / MISSING] ${title}  <--- We found a book that was deleted!`);
      }
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

findBooks();
