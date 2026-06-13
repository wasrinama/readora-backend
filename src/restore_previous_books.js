import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Book from './models/Book.js';

dotenv.config();

const booksToRestore = [
  {
    _id: "6a16a2ebe96dfc47e0c0c699",
    title: "Dear Victoria — ආදරණීය වික්ටෝரියා",
    author: "Mohan Raj Madawala",
    price: 1390,
    category: "Novel",
    description: "Sinhala historical fiction novel by Mohan Raj Madawala.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    stock: 15,
    language: "Sinhala",
    publisher: "Sarasavi Publishers",
    pages: 320,
    publishYear: 2016,
    isbn: "978-9556711585",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a169de7e96dfc47e0c0c633",
    title: "காந்தளூர் வசந்தகுமாரன் கதை",
    author: "Sujatha",
    price: 1732.5,
    category: "Novel",
    description: "Tamil historical fiction novel by Sujatha.",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    stock: 12,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 280,
    publishYear: 1995,
    isbn: "978-8184762945",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a16c610e96dfc47e0c0c876",
    title: "A2 Sketch Pepar 180gsm",
    author: "Generic",
    price: 95,
    category: "Stationery",
    description: "Premium A2 size sketching paper, 180gsm thickness.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    stock: 100,
    language: "English",
    publisher: "Store Brand",
    pages: 1,
    publishYear: 2024,
    isbn: "STAT-A2-180",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a16a91ae96dfc47e0c0c733",
    title: "ஒவ்வொரு விஷயமும் உங்களைப் பாதிக்க அனுமதிக்காதீர்கள் (Stop Letting Everything Affect You)",
    author: "Richard Carlson",
    price: 2310,
    category: "Self Development",
    description: "Tamil translation of the self-development bestseller 'Stop Letting Everything Affect You'.",
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    stock: 20,
    language: "Tamil",
    publisher: "Kalai Publications",
    pages: 215,
    publishYear: 2018,
    isbn: "978-8184762952",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a16c4e5e96dfc47e0c0c86d",
    title: "Business Card Holder Pvc 120Pg",
    author: "Generic",
    price: 345,
    category: "Stationery",
    description: "Durable PVC business card holder with 120 pages capacity.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
    rating: 4.4,
    stock: 50,
    language: "English",
    publisher: "Store Brand",
    pages: 120,
    publishYear: 2023,
    isbn: "STAT-BCH-120",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a16aa46e96dfc47e0c0c73c",
    title: "இஸ்ரேல் (தோற்றம் - வளர்ச்சி - ஆதிக்கம்)",
    author: "Aru. Yazhini",
    price: 1732.5,
    category: "History",
    description: "An in-depth Tamil book about the history, origin, growth, and dominance of Israel.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    stock: 10,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 312,
    publishYear: 2020,
    isbn: "978-8184762960",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a171855e96dfc47e0c0cb20",
    title: "அணிலாடும் முன்றில்",
    author: "Na. Muthukumar",
    price: 1386,
    category: "Novel",
    description: "A beautiful Tamil literary book written by lyricist Na. Muthukumar.",
    coverImage: "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    stock: 8,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 200,
    publishYear: 2013,
    isbn: "978-8184762977",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a266607e96dfc47e0c0cda3",
    title: "Buddhism and Dynastic Power in South India",
    author: "Unknown",
    price: 4900,
    category: "History",
    description: "Academic book exploring Buddhism and dynastic power in South Indian kingdoms.",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    stock: 5,
    language: "English",
    publisher: "Oxford University Press",
    pages: 420,
    publishYear: 2011,
    isbn: "978-0199291151",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a266114e96dfc47e0c0cd8c",
    title: "பூதத்தம்பி கோட்டை",
    author: "Tamil Author",
    price: 800,
    category: "History",
    description: "Tamil book on historical ruins and tales of Poothathambi Kottai.",
    coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600",
    rating: 4.5,
    stock: 15,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 180,
    publishYear: 2014,
    isbn: "978-8184762984",
    availabilityStatus: "In Stock"
  },
  {
    _id: "6a2d0ffda7c4f36fd433b588",
    title: "அப்புறம் பேசறேன்..",
    author: "Sujatha",
    price: 2079,
    category: "Novel",
    description: "Tamil novel written by the renowned author Sujatha.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    stock: 14,
    language: "Tamil",
    publisher: "Vikatan Publications",
    pages: 224,
    publishYear: 1998,
    isbn: "978-8184762991",
    availabilityStatus: "In Stock"
  }
];

async function restore() {
  await connectDB();

  try {
    let restoredCount = 0;
    for (const b of booksToRestore) {
      const exists = await Book.findById(b._id);
      if (!exists) {
        const newBook = new Book(b);
        await newBook.save();
        console.log(`✅ Restored book: "${b.title}"`);
        restoredCount++;
      } else {
        console.log(`ℹ️ Book already exists: "${b.title}"`);
      }
    }
    console.log(`\n🎉 Successfully restored ${restoredCount} books.`);
  } catch (err) {
    console.error('Error during restore:', err.message);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

restore();
