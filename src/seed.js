import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, readFallbackData, writeFallbackData } from './config/db.js';
import Book from './models/Book.js';
import Category from './models/Category.js';

dotenv.config();

const sampleCategories = [
  { name: "Fiction" },
  { name: "Non Fiction" },
  { name: "Kavithai (Poetry)" },
  { name: "Novel" },
  { name: "Short Stories" },
  { name: "History" },
  { name: "Education" },
  { name: "Children's Books" },
  { name: "Religion" },
  { name: "Biography" },
  { name: "Science" },
  { name: "Technology" },
  { name: "Business" },
  { name: "Self Development" }
];

const sampleBooks = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 1800,
    category: "Fiction",
    description: "A gorgeous fable about following your dreams. The Alchemist has established itself as a modern classic, universally admired. Constantly reminding us of the power of listening to our hearts.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    featured: true,
    stock: 12,
    language: "English",
    publisher: "HarperOne",
    pages: 208,
    publishYear: 1988,
    isbn: "978-0061122415",
    availabilityStatus: "In Stock"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    price: 2400,
    category: "Business",
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies.",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    featured: true,
    stock: 25,
    language: "English",
    publisher: "Avery",
    pages: 320,
    publishYear: 2018,
    isbn: "978-0735211292",
    availabilityStatus: "In Stock"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    price: 2100,
    category: "Education",
    description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    featured: false,
    stock: 8,
    language: "English",
    publisher: "Random House",
    pages: 352,
    publishYear: 2018,
    isbn: "978-0399590504",
    availabilityStatus: "In Stock"
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    price: 2900,
    category: "Business",
    description: "Daniel Kahneman, the renowned psychologist and winner of the Nobel Prize in Economics, takes us on a groundbreaking tour of the mind.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    featured: true,
    stock: 15,
    language: "English",
    publisher: "Farrar, Straus and Giroux",
    pages: 499,
    publishYear: 2011,
    isbn: "978-0374533557",
    availabilityStatus: "In Stock"
  },
  {
    title: "The Selfish Gene",
    author: "Richard Dawkins",
    price: 2200,
    category: "Science",
    description: "Richard Dawkins' brilliant reformulation of the theory of natural selection has become a classic work of science, widely praised.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    featured: false,
    stock: 10,
    language: "English",
    publisher: "Oxford University Press",
    pages: 360,
    publishYear: 1976,
    isbn: "978-0199291151",
    availabilityStatus: "In Stock"
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    price: 2600,
    category: "Science",
    description: "Stephen Hawking, one of the most brilliant theoretical physicists of our time, guides us through the cosmology of black holes, space, and time.",
    coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    featured: true,
    stock: 14,
    language: "English",
    publisher: "Bantam Books",
    pages: 212,
    publishYear: 1988,
    isbn: "978-0553380163",
    availabilityStatus: "In Stock"
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    price: 2500,
    category: "Business",
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses. It provides a scientific approach to creating and managing startups.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    featured: false,
    stock: 18,
    language: "English",
    publisher: "Crown Business",
    pages: 336,
    publishYear: 2011,
    isbn: "978-0307887894",
    availabilityStatus: "In Stock"
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    price: 1950,
    category: "Business",
    description: "Explodes the myth that you need to earn a high income to be rich and explains the difference between working for money and having your money work for you.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    featured: true,
    stock: 30,
    language: "English",
    publisher: "Warner Books",
    pages: 207,
    publishYear: 1997,
    isbn: "978-1612680194",
    availabilityStatus: "In Stock"
  },
  {
    title: "Ponniyin Selvan (Tamil)",
    author: "Kalki Krishnamurthy",
    price: 1500,
    category: "Novel",
    description: "Ponniyin Selvan is a historic Tamil historical fiction novel by Kalki Krishnamurthy, depicting the early days of Chola prince Arulmozhivarman.",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    featured: true,
    stock: 12,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 2400,
    publishYear: 1950,
    isbn: "978-8184762945",
    availabilityStatus: "In Stock"
  },
  {
    title: "Sivagamiyin Sabatham (Tamil)",
    author: "Kalki Krishnamurthy",
    price: 1800,
    category: "Novel",
    description: "Sivagamiyin Sabatham is a Tamil historical novel written by Kalki Krishnamurthy, depicting Narasimhavarman I Pallava's rule.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    featured: false,
    stock: 10,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 1024,
    publishYear: 1948,
    isbn: "978-8184762952",
    availabilityStatus: "In Stock"
  },
  {
    title: "Madol Doova (Sinhala)",
    author: "Martin Wickramasinghe",
    price: 850,
    category: "Novel",
    description: "Madol Doova is a children's novel written by Martin Wickramasinghe. The book remains a beloved classic of Sri Lankan literature.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    featured: true,
    stock: 15,
    language: "Sinhala",
    publisher: "Sarasavi Publishers",
    pages: 144,
    publishYear: 1947,
    isbn: "978-9556711585",
    availabilityStatus: "In Stock"
  },
  {
    title: "Gamperaliya (Sinhala)",
    author: "Martin Wickramasinghe",
    price: 1200,
    category: "Novel",
    description: "Gamperaliya is a landmark Sinhala novel written by Martin Wickramasinghe, exploring the transition of Sri Lankan village families.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    featured: false,
    stock: 8,
    language: "Sinhala",
    publisher: "Sarasavi Publishers",
    pages: 224,
    publishYear: 1944,
    isbn: "978-9556711592",
    availabilityStatus: "In Stock"
  }
];

const seedDB = async () => {
  await connectDB();

  const isMock = process.env.USE_MOCK_DB === 'true';

  try {
    if (isMock) {
      console.log('🌱  Seeding local JSON fallback database...');
      const db = readFallbackData();
      
      // Map mock categories with IDs
      const categoriesWithIds = sampleCategories.map((c, index) => ({
        _id: `cat_${index + 1}`,
        ...c
      }));

      // Map mock books with IDs
      const booksWithIds = sampleBooks.map((b, index) => ({
        _id: `book_${index + 1}`,
        ...b
      }));

      db.categories = categoriesWithIds;
      db.books = booksWithIds;
      writeFallbackData(db);
      console.log('✅  JSON fallback database seeded successfully with', db.books.length, 'books and', db.categories.length, 'categories.');
    } else {
      console.log('🌱  Seeding MongoDB database...');
      
      // Seed Categories
      await Category.deleteMany({});
      const seededCategories = await Category.insertMany(sampleCategories);
      console.log(`✅  Seeded ${seededCategories.length} categories.`);

      // Seed Books
      await Book.deleteMany({});
      const seededBooks = await Book.insertMany(sampleBooks);
      console.log(`✅  Seeded ${seededBooks.length} books.`);

      console.log('✅  MongoDB database seeded successfully.');
    }
  } catch (error) {
    console.error('❌  Error seeding database:', error.message);
  } finally {
    if (!isMock) {
      mongoose.connection.close();
    }
    process.exit(0);
  }
};

seedDB();
