const express = require('express');
const { getNotifications, createNotification, markAsRead } = require('../controllers/notificationController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getNotifications);
router.post('/', protect, authorize('admin'), requirePermission('notifications.manage'), createNotification);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
