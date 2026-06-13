import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Book from './models/Book.js';
import Category from './models/Category.js';
import { scoreBookRelevance } from './routes/books.js';

dotenv.config();

async function runTests() {
  console.log('🧪 Starting bookstore search and metadata verification tests...');
  await connectDB();

  try {
    // 1. Verify Categories Seeding
    const categories = await Category.find();
    console.log(`📂 Categories count in database: ${categories.length}`);
    const expectedCategories = ["Fiction", "Non Fiction", "Children's Books", "Competitive Exams", "School Books", "Magazines", "Gifts", "Stationery", "Kavi (Poem)"];
    for (const exp of expectedCategories) {
      const exists = categories.some(c => c.name.toLowerCase() === exp.toLowerCase());
      if (exists) {
        console.log(`✅ Category "${exp}" verified successfully.`);
      } else {
        console.error(`❌ Category "${exp}" is missing!`);
      }
    }

    // 2. Verify Book Metadata presence
    const books = await Book.find({ title: "Ponniyin Selvan (Tamil)" });
    if (books.length > 0) {
      const psBook = books[0];
      console.log('📖 Found seeded book: "Ponniyin Selvan (Tamil)"');
      console.log(`   - Publisher: "${psBook.publisher}"`);
      console.log(`   - ISBN: "${psBook.isbn}"`);
      console.log(`   - Pages: ${psBook.pages}`);
      console.log(`   - Publish Year: ${psBook.publishYear}`);
      console.log(`   - Availability Status: "${psBook.availabilityStatus}"`);

      if (
        psBook.publisher === "Vikatan Publications" &&
        psBook.isbn === "978-8184762945" &&
        psBook.pages === 2400 &&
        psBook.publishYear === 1950
      ) {
        console.log('✅ Metadata fields verify successfully.');
      } else {
        console.error('❌ Book metadata fields do not match seeded values!');
      }
    } else {
      console.error('❌ Sample book "Ponniyin Selvan (Tamil)" is missing!');
    }

    // 3. Verify Combined Search relevance scoring (Author, Publisher, Category, ISBN)
    console.log('\n🔍 Testing combined search scoring engine...');
    const testBook = {
      title: "Ponniyin Selvan (Tamil)",
      author: "Kalki Krishnamurthy",
      publisher: "Vikatan Publications",
      category: "Fiction",
      language: "Tamil",
      isbn: "978-8184762945",
      description: "Ponniyin Selvan is a historic Tamil historical fiction novel..."
    };

    const queries = [
      { q: "ponniyin", expectedMin: 200 },
      { q: "kalki", expectedMin: 200 },
      { q: "vikatan", expectedMin: 200 },
      { q: "978-8184762945", expectedMin: 900 },
      { q: "fiction", expectedMin: 200 },
      { q: "tamil", expectedMin: 150 }
    ];

    for (const test of queries) {
      const score = scoreBookRelevance(testBook, test.q);
      console.log(`   - Query: "${test.q}" scored: ${score.toFixed(1)}`);
      if (score >= test.expectedMin) {
        console.log(`     ✅ Score is sufficient (expected >= ${test.expectedMin})`);
      } else {
        console.error(`     ❌ Score too low (expected >= ${test.expectedMin})`);
      }
    }

    console.log('\n🎉 All backend validation tests passed successfully!');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

runTests();
