const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { getUserPermissions } = require('../constants/permissions');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const attachPermissions = (user) => {
  const obj = user.toJSON ? user.toJSON() : user;
  return { ...obj, permissions: getUserPermissions(user) };
};

// @desc    Register admin (protected — super admin only via rbac route preferred)
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'admin',
    isSuperAdmin: true,
  });

  res.status(201).json({
    success: true,
    data: attachPermissions(user),
    token: generateToken(user._id),
  });
});

// @desc    Login with email or phone (mobile + general)
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide credentials' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).populate('team coach adminRole');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account deactivated' });
  }

  res.json({
    success: true,
    data: attachPermissions(user),
    token: generateToken(user._id),
  });
});

// @desc    Admin portal login — blocks coach/team
// @route   POST /api/auth/admin-login
const adminLogin = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide credentials' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).populate('adminRole');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Coach and Team users cannot access the admin portal. Use the mobile app.',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account deactivated' });
  }

  res.json({
    success: true,
    data: attachPermissions(user),
    token: generateToken(user._id),
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('team coach adminRole');
  res.json({ success: true, data: attachPermissions(user) });
});

// @desc    Update push token
// @route   PUT /api/auth/push-token
const updatePushToken = asyncHandler(async (req, res) => {
  const { pushToken } = req.body;
  await User.findByIdAndUpdate(req.user._id, { pushToken });
  res.json({ success: true, message: 'Push token updated' });
});

module.exports = { register, login, adminLogin, getMe, updatePushToken };
