import express from 'express';
import { readFallbackData } from '../config/db.js';
import Book from '../models/Book.js';
import Category from '../models/Category.js';
import { slugify } from '../utils/slugify.js';

const router = express.Router();

const FRONTEND_URL = 'https://readora.lk';

// Helper to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// @route   GET /api/seo/sitemap.xml
// @desc    Generate dynamic sitemap.xml containing all SEO routes
router.get('/sitemap.xml', async (req, res) => {
  const isMock = process.env.USE_MOCK_DB === 'true';
  
  try {
    let books = [];
    let categories = [];
    
    if (isMock) {
      const db = readFallbackData();
      books = db.books || [];
      categories = db.categories || [];
    } else {
      books = await Book.find({});
      categories = await Category.find({});
    }

    // Static pages
    const staticPages = [
      '',
      '/books',
      '/about',
      '/offers',
      '/new-releases',
      '/best-selling'
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}${page}</loc>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    }

    // Add dynamic books
    for (const book of books) {
      const slug = book.slug || slugify(book.title);
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}/books/${escapeXml(slug)}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    }

    // Add dynamic categories
    for (const cat of categories) {
      const slug = slugify(cat.name);
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}/categories/${escapeXml(slug)}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    // Add dynamic unique authors
    const authors = Array.from(new Set(books.map(b => b.author).filter(Boolean)));
    for (const author of authors) {
      const slug = slugify(author);
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}/authors/${escapeXml(slug)}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    // Add dynamic unique publishers
    const publishers = Array.from(new Set(books.map(b => b.publisher).filter(Boolean)));
    for (const publisher of publishers) {
      const slug = slugify(publisher);
      xml += '  <url>\n';
      xml += `    <loc>${FRONTEND_URL}/publishers/${escapeXml(slug)}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.5</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    res.status(500).json({ message: 'Error generating sitemap', error: error.message });
  }
});

// @route   GET /api/seo/robots.txt
// @desc    Serve robots.txt routing instructions pointing to the dynamic sitemap
router.get('/robots.txt', (req, res) => {
  let txt = 'User-agent: *\n';
  txt += 'Allow: /\n\n';
  txt += `Sitemap: ${FRONTEND_URL}/sitemap.xml\n`;

  res.header('Content-Type', 'text/plain');
  res.status(200).send(txt);
});

export default router;
