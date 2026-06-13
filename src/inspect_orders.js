import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Order from './models/Order.js';

dotenv.config();

async function inspect() {
  await connectDB();

  try {
    const orders = await Order.find();
    console.log('--- Order Items Details ---');
    orders.forEach(o => {
      if (o.items) {
        o.items.forEach(item => {
          console.log(JSON.stringify(item, null, 2));
        });
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

inspect();
