import express from 'express';
import jwt from 'jsonwebtoken';
import { readFallbackData, writeFallbackData } from '../config/db.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bookstore_super_secret_key';

// @route   POST /api/auth/login
// @desc    Phone number or static admin login
router.post('/login', async (req, res) => {
  const { phoneNumber, name, username, password } = req.body;

  // Static admin credentials check
  if (username && password) {
    if (username === 'admin' && password === 'admin123') {
      const adminPhone = (process.env.ADMIN_PHONE || '0766572148').trim().replace(/\s+/g, '');
      let user;
      const isMock = process.env.USE_MOCK_DB === 'true';

      try {
        if (isMock) {
          const db = readFallbackData();
          user = db.users.find(u => u.role === 'admin' || u.phoneNumber === adminPhone);
          if (!user) {
            user = {
              _id: 'user_admin',
              phoneNumber: adminPhone,
              name: 'Administrator',
              address: 'Head Office',
              role: 'admin'
            };
            db.users.push(user);
            writeFallbackData(db);
          }
        } else {
          user = await User.findOne({ role: 'admin' });
          if (!user) {
            user = new User({
              phoneNumber: adminPhone,
              name: 'Administrator',
              role: 'admin',
              address: 'Head Office'
            });
            await user.save();
          }
        }

        // Sign Token
        const payload = {
          id: user._id,
          phoneNumber: user.phoneNumber,
          role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        return res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            phoneNumber: user.phoneNumber,
            address: user.address || '',
            role: user.role
          }
        });
      } catch (error) {
        return res.status(500).json({ message: 'Admin login error', error: error.message });
      }
    } else {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
  }

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required.' });
  }

  // Normalize phone number (remove spaces, etc.)
  const normalizedPhone = phoneNumber.trim().replace(/\s+/g, '');

  // Check if phone matches configured admin number (normalizing prefix formats)
  const isAdmin = (phone) => {
    const adminEnv = (process.env.ADMIN_PHONE || '0766572148').trim().replace(/\s+/g, '');
    const cleanPhone = phone.replace(/^\+94/, '0');
    const cleanAdmin = adminEnv.replace(/^\+94/, '0');
    return cleanPhone === cleanAdmin;
  };

  try {
    let user;
    const isMock = process.env.USE_MOCK_DB === 'true';

    if (isMock) {
      const db = readFallbackData();
      user = db.users.find(u => u.phoneNumber === normalizedPhone);
      
      if (!user) {
        // Create user
        user = {
          _id: 'user_' + Date.now(),
          phoneNumber: normalizedPhone,
          name: name ? name.trim() : `Customer (${normalizedPhone.slice(-4)})`,
          address: '',
          role: isAdmin(normalizedPhone) ? 'admin' : 'user'
        };
        db.users.push(user);
        writeFallbackData(db);
      } else if (name) {
        // Update name if supplied
        user.name = name.trim();
        writeFallbackData(db);
      }
    } else {
      user = await User.findOne({ phoneNumber: normalizedPhone });

      if (!user) {
        const role = isAdmin(normalizedPhone) ? 'admin' : 'user';
        user = new User({
          phoneNumber: normalizedPhone,
          name: name ? name.trim() : `Customer (${normalizedPhone.slice(-4)})`,
          role
        });
        await user.save();
      } else if (name) {
        user.name = name.trim();
        await user.save();
      }
    }

    // Sign Token
    const payload = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        address: user.address || '',
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Login error', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      phoneNumber: req.user.phoneNumber,
      address: req.user.address || '',
      role: req.user.role
    }
  });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
router.put('/profile', verifyToken, async (req, res) => {
  const { name, address } = req.body;
  const isMock = process.env.USE_MOCK_DB === 'true';
  const userId = req.user._id || req.user.id;

  try {
    if (isMock) {
      const db = readFallbackData();
      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      if (name) db.users[userIndex].name = name;
      if (address !== undefined) db.users[userIndex].address = address;
      
      const updatedUser = db.users[userIndex];
      writeFallbackData(db);
      
      res.json({
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
          address: updatedUser.address || '',
          role: updatedUser.role
        }
      });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (name) user.name = name;
      if (address !== undefined) user.address = address;

      await user.save();
      
      res.json({
        user: {
          id: user._id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          address: user.address || '',
          role: user.role
        }
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

export default router;
