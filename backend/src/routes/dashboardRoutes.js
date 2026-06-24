const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, authorize('admin'), requirePermission('dashboard.view'), getDashboardStats);

module.exports = router;
