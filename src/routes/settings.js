import express from 'express';
import { readFallbackData, writeFallbackData } from '../config/db.js';
import Setting from '../models/Setting.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/settings/:key
// @desc    Get setting by key
router.get('/:key', async (req, res) => {
  const isMock = process.env.USE_MOCK_DB === 'true';
  const { key } = req.params;

  try {
    if (isMock) {
      const db = readFallbackData();
      if (!db.settings) db.settings = [];
      const setting = db.settings.find(s => s.key === key);
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      return res.json(setting);
    } else {
      const setting = await Setting.findOne({ key });
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      return res.json(setting);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving setting', error: error.message });
  }
});

// @route   POST /api/settings
// @desc    Create or update a setting (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  const { key, value } = req.body;
  const isMock = process.env.USE_MOCK_DB === 'true';

  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Missing key or value.' });
  }

  try {
    if (isMock) {
      const db = readFallbackData();
      if (!db.settings) db.settings = [];
      const index = db.settings.findIndex(s => s.key === key);

      const updatedSetting = {
        _id: index !== -1 ? db.settings[index]._id : 'setting_' + Date.now(),
        key,
        value,
        createdAt: index !== -1 ? db.settings[index].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (index !== -1) {
        db.settings[index] = updatedSetting;
      } else {
        db.settings.push(updatedSetting);
      }

      writeFallbackData(db);
      return res.status(200).json(updatedSetting);
    } else {
      const updatedSetting = await Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true, runValidators: true }
      );
      return res.status(200).json(updatedSetting);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving setting', error: error.message });
  }
});

export default router;
