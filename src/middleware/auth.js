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
  // In mock DB mode allow a relaxed admin flow to ease local/offline development:
  // - Try to verify normally; if that fails and we're using the fallback DB,
  //   pick an available admin user from the fallback DB and continue.
  const isMock = process.env.USE_MOCK_DB === 'true';

  const authHeader = req.headers.authorization;

  const tryAssignAdminFromFallback = () => {
    if (!isMock) return false;
    try {
      const db = readFallbackData();
      const admin = db.users.find(u => u.role === 'admin') || db.users[0];
      if (admin) {
        req.user = admin;
        return true;
      }
    } catch (err) {
      // ignore and fall through to forbidden
    }
    return false;
  };

  // If mock DB is enabled, allow falling back to a stored admin when token
  // verification fails or when a mock token is present.
  if (isMock) {
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'bookstore_super_secret_key';
      try {
        const decoded = jwt.verify(token, jwtSecret);
        // attach minimal user structure expected by handlers
        req.user = decoded;
        if (req.user.role === 'admin') return next();
      } catch (err) {
        // invalid JWT for mock env, try fallback admin from JSON DB
        if (tryAssignAdminFromFallback()) return next();
      }
    } else {
      // No auth header in mock mode — try to assign an admin anyway
      if (tryAssignAdminFromFallback()) return next();
    }

    return res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
  }

  // Non-mock (normal) flow — use verifyToken middleware to validate and then check role
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden. Admin credentials required.' });
    }
  });
};
