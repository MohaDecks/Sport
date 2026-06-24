const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getUserPermissions } = require('../constants/permissions');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('team coach adminRole');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    req.user = user;
    req.userPermissions = getUserPermissions(user);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  if (req.user.isSuperAdmin) return next();

  const userPerms = req.userPermissions || getUserPermissions(req.user);
  const allowed = permissions.some((p) => userPerms.includes(p));
  if (!allowed) {
    return res.status(403).json({ success: false, message: 'Permission denied' });
  }
  next();
};

module.exports = { protect, authorize, requirePermission };
