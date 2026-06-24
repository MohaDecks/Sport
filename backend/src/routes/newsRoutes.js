const express = require('express');
const { getNews, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect, authorize, requirePermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getNews);
const newsUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

router.post('/', protect, authorize('admin'), requirePermission('news.manage'), newsUpload, createNews);
router.put('/:id', protect, authorize('admin'), requirePermission('news.manage'), newsUpload, updateNews);
router.delete('/:id', protect, authorize('admin'), requirePermission('news.manage'), deleteNews);

module.exports = router;
