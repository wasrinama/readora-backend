import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function inspectDb() {
  if (!uri) {
    console.error('No MONGODB_URI found');
    return;
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB Atlas cluster');

    const db = client.db('pos_system');
    const productsCol = db.collection('products');
    const products = await productsCol.find().limit(10).toArray();
    
    console.log('\n--- Sample Products from pos_system database ---');
    products.forEach((p, idx) => {
      console.log(`${idx + 1}: ${p.name || p.title} (Price: ${p.price}, Category: ${p.category})`);
      console.log(JSON.stringify(p).slice(0, 300));
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

inspectDb();
