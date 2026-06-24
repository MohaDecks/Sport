const express = require('express');
const { register, login, adminLogin, getMe, updatePushToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.get('/me', protect, getMe);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
