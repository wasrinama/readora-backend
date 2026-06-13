import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function listDbs() {
  if (!uri) {
    console.error('No MONGODB_URI found in env');
    return;
  }

  // Extract base URI (without database name) to connect to the server
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB Atlas cluster');

    const admin = client.db().admin();
    const dbsInfo = await admin.listDatabases();
    console.log('\n--- Databases list ---');

    for (const dbInfo of dbsInfo.databases) {
      console.log(`\nDB: "${dbInfo.name}" (Size on disk: ${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        console.log(`   - Collection: "${col.name}" -> ${count} documents`);
      }
    }
  } catch (err) {
    console.error('Error listing databases:', err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

listDbs();
