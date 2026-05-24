import jwt from 'jsonwebtoken';
import { readFallbackData } from '../config/db.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'bookstore_super_secret_key';
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    if (process.env.USE_MOCK_DB === 'true') {
      const db = readFallbackData();
      const user = db.users.find(u => u._id === decoded.id || u.phoneNumber === decoded.phoneNumber);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      req.user = user;
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      req.user = user;
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Authentication server error', error: error.message });
  }
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
    }
  });
};
