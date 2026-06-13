import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  stock: {
    type: Number,
    default: 10,
    min: 0
  },
  language: {
    type: String,
    enum: ['English', 'Tamil', 'Sinhala'],
    default: 'English'
  },
  publisher: {
    type: String,
    trim: true,
    default: ''
  },
  pages: {
    type: Number,
    default: 0
  },
  publishYear: {
    type: Number,
    default: new Date().getFullYear()
  },
  isbn: {
    type: String,
    trim: true,
    default: ''
  },
  availabilityStatus: {
    type: String,
    enum: ['In Stock', 'Out of Stock', 'Pre-Order'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

const Book = mongoose.model('Book', bookSchema);
export default Book;
