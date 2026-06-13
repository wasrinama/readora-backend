import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Book from './models/Book.js';
import { scoreBookRelevance } from './routes/books.js';

dotenv.config();

const testQueries = {
  English: [
    { query: 'Alchemist', expectedTitle: 'The Alchemist' },
    { query: 'Habits', expectedTitle: 'Atomic Habits' }
  ],
  TamilNative: [
    { query: 'காந்தளூர்', expectedTitle: 'காந்தளூர் வசந்தகுமாரன் கதை' },
    { query: 'அணிலாடும்', expectedTitle: 'அணிலாடும் முன்றில்' }
  ],
  SinhalaNative: [
    { query: 'වික්ටෝරියා', expectedTitle: 'Dear Victoria — ආදරණීය වික්ටෝරියා' },
    { query: 'ගම්පෙරළිය', expectedTitle: 'Gamperaliya (Sinhala)' }
  ],
  Thanglish: [
    { query: 'ponniyin', expectedTitle: 'Ponniyin Selvan' },
    { query: 'kanthaloor', expectedTitle: 'காந்தளூர் வசந்தகுமாரன் கதை' },
    { query: 'anilaadum', expectedTitle: 'அணிலாடும் முன்றில்' },
    { query: 'pesaren', expectedTitle: 'அப்புறம் பேசறேன்..' }
  ]
};

async function verifySearch() {
  await connectDB();

  try {
    const allBooks = await Book.find({});
    console.log(`\n📚 Total books in database: ${allBooks.length}`);
    if (allBooks.length === 0) {
      console.log('❌ No books found in database to search against!');
      return;
    }

    console.log('\n--- 🧪 STARTING LANGUAGE SEARCH VERIFICATION TESTS ---');

    for (const [lang, tests] of Object.entries(testQueries)) {
      console.log(`\n=================== Language: ${lang} ===================`);
      
      for (const t of tests) {
        console.log(`🔎 Searching for: "${t.query}"`);
        
        // Score all books and sort
        const results = allBooks
          .map(b => {
            const bookObj = b.toObject();
            return {
              title: bookObj.title,
              author: bookObj.author,
              score: scoreBookRelevance(bookObj, t.query)
            };
          })
          .filter(b => b.score > 0)
          .sort((a, b) => b.score - a.score);

        if (results.length > 0) {
          console.log(`   ✅ Matches found (${results.length}):`);
          results.slice(0, 3).forEach((r, idx) => {
            console.log(`      ${idx + 1}. "${r.title}" by ${r.author} (Score: ${r.score.toFixed(1)})`);
          });
          
          const topMatch = results[0].title.toLowerCase();
          const expected = t.expectedTitle.toLowerCase();
          
          if (topMatch.includes(expected) || expected.includes(topMatch)) {
            console.log(`   🎉 SUCCESS: Correct top match found!`);
          } else {
            console.log(`   ⚠️ WARNING: Top match was "${results[0].title}", but expected "${t.expectedTitle}"`);
          }
        } else {
          console.log(`   ❌ FAILED: No matches found for query "${t.query}"`);
        }
      }
    }
  } catch (err) {
    console.error('Error running test:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

verifySearch();
