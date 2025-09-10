import express from 'express';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// Base directory where translation JSONs reside
const LOCALES_DIR = path.join(__dirname, '../../../frontend/src/i18n/locales');

// Helper to build file path safely
function localeFilePath(lang) {
  return path.join(LOCALES_DIR, `${lang}.json`);
}

// GET /translations/:lang - fetch translation file
router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  try {
    const filePath = localeFilePath(lang);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Locale not found' });
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: 'Failed to read locale file' });
  }
});

// PUT /translations/:lang - overwrite translation file
router.put('/:lang', express.json({ limit: '2mb' }), (req, res) => {
  const { lang } = req.params;
  const translations = req.body;
  if (!translations || typeof translations !== 'object') {
    return res.status(400).json({ message: 'Invalid body' });
  }
  try {
    const filePath = localeFilePath(lang);
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf-8');
    res.json({ message: 'Locale saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to write locale file' });
  }
});

export default router; 