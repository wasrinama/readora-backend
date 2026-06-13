import express from 'express';
import { readFallbackData, writeFallbackData } from '../config/db.js';
import Book from '../models/Book.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with optional search and category filters
router.get('/', async (req, res) => {
  const { search, category, featured, language } = req.query;
  const isMock = process.env.USE_MOCK_DB === 'true';

  try {
    if (isMock) {
      const db = readFallbackData();
      let books = [...db.books];

      // Filter by category
      if (category && category !== 'All') {
        books = books.filter(b => b.category.toLowerCase() === category.toLowerCase());
      }

      // Filter by language
      if (language && language !== 'All') {
        books = books.filter(b => b.language && b.language.toLowerCase() === language.toLowerCase());
      }

      // Filter by featured
      if (featured === 'true') {
        books = books.filter(b => b.featured === true);
      }

      // Filter by search (title or author)
      if (search) {
        const query = search.toLowerCase();
        books = books.filter(b => 
          b.title.toLowerCase().includes(query) || 
          b.author.toLowerCase().includes(query)
        );
      }

      return res.json(books);
    } else {
      let filter = {};

      if (category && category !== 'All') {
        filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      if (language && language !== 'All') {
        filter.language = { $regex: new RegExp(`^${language}$`, 'i') };
      }

      if (featured === 'true') {
        filter.featured = true;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } }
        ];
      }

      const books = await Book.find(filter).sort({ createdAt: -1 });
      res.json(books);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving books', error: error.message });
  }
});

// @route   GET /api/books/:id
// @desc    Get a single book by ID
router.get('/:id', async (req, res) => {
  const isMock = process.env.USE_MOCK_DB === 'true';

  try {
    if (isMock) {
      const db = readFallbackData();
      const book = db.books.find(b => b._id === req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      return res.json(book);
    } else {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving book details', error: error.message });
  }
});

// @route   POST /api/books
// @desc    Create a new book (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  const { title, author, price, category, description, coverImage, stock, featured, language } = req.body;
  const isMock = process.env.USE_MOCK_DB === 'true';

  if (!title || !author || !price || !category || !description) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    if (isMock) {
      const db = readFallbackData();
      const newBook = {
        _id: 'book_' + Date.now(),
        title,
        author,
        price: Number(price),
        category,
        description,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        stock: Number(stock) || 10,
        featured: featured === true || featured === 'true',
        rating: 4.5,
        language: language || 'English'
      };

      db.books.push(newBook);
      writeFallbackData(db);
      res.status(201).json(newBook);
    } else {
      const newBook = new Book({
        title,
        author,
        price,
        category,
        description,
        coverImage,
        stock,
        featured,
        language
      });

      await newBook.save();
      res.status(201).json(newBook);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating book', error: error.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update an existing book (Admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const isMock = process.env.USE_MOCK_DB === 'true';
  const { title, author, price, category, description, coverImage, stock, featured, language } = req.body;

  try {
    if (isMock) {
      const db = readFallbackData();
      const index = db.books.findIndex(b => b._id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Book not found' });
      }

      const updatedBook = {
        ...db.books[index],
        title: title || db.books[index].title,
        author: author || db.books[index].author,
        price: price !== undefined ? Number(price) : db.books[index].price,
        category: category || db.books[index].category,
        description: description || db.books[index].description,
        coverImage: coverImage || db.books[index].coverImage,
        stock: stock !== undefined ? Number(stock) : db.books[index].stock,
        featured: featured !== undefined ? (featured === true || featured === 'true') : db.books[index].featured,
        language: language || db.books[index].language
      };

      db.books[index] = updatedBook;
      writeFallbackData(db);
      res.json(updatedBook);
    } else {
      const updatedBook = await Book.findByIdAndUpdate(
        req.params.id,
        { title, author, price, category, description, coverImage, stock, featured, language },
        { new: true, runValidators: true }
      );

      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(updatedBook);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating book', error: error.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const isMock = process.env.USE_MOCK_DB === 'true';

  try {
    if (isMock) {
      const db = readFallbackData();
      const index = db.books.findIndex(b => b._id === req.params.id);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Book not found' });
      }

      db.books.splice(index, 1);
      writeFallbackData(db);
      res.json({ message: 'Book deleted successfully' });
    } else {
      const deletedBook = await Book.findByIdAndDelete(req.params.id);
      if (!deletedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json({ message: 'Book deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book', error: error.message });
  }
});

export default router;
