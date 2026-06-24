const AdminRole = require('../models/AdminRole');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { PERMISSION_GROUPS, PERMISSION_MENUS, ALL_PERMISSIONS } = require('../constants/permissions');

const getPermissions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { groups: PERMISSION_GROUPS, menus: PERMISSION_MENUS, all: ALL_PERMISSIONS } });
});

const getRoles = asyncHandler(async (req, res) => {
  const roles = await AdminRole.find().sort({ name: 1 });
  res.json({ success: true, data: roles });
});

const createRole = asyncHandler(async (req, res) => {
  const { name, description, permissions, isActive } = req.body;
  const validPerms = (permissions || []).filter((p) => ALL_PERMISSIONS.includes(p));
  const role = await AdminRole.create({
    name,
    description,
    permissions: validPerms,
    isActive: isActive !== false,
  });
  res.status(201).json({ success: true, data: role });
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await AdminRole.findById(req.params.id);
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  if (role.isSystem && !req.user.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Cannot edit system role' });
  }

  const { name, description, permissions, isActive } = req.body;
  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (isActive !== undefined) role.isActive = isActive;
  if (permissions) {
    role.permissions = permissions.filter((p) => ALL_PERMISSIONS.includes(p));
  }
  await role.save();
  res.json({ success: true, data: role });
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await AdminRole.findById(req.params.id);
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  if (role.isSystem) {
    return res.status(403).json({ success: false, message: 'Cannot delete system role' });
  }

  const inUse = await User.countDocuments({ adminRole: role._id });
  if (inUse) {
    return res.status(400).json({ success: false, message: 'Role is assigned to admin users' });
  }

  await role.deleteOne();
  res.json({ success: true, message: 'Role deleted' });
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'admin' })
    .select('-password')
    .populate('adminRole')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

const createAdminUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, adminRole, isSuperAdmin } = req.body;

  if (!fullName || !password || (!email && !phone)) {
    return res.status(400).json({ success: false, message: 'Name, password and email/phone required' });
  }

  const exists = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase() }] : []),
      ...(phone ? [{ phone }] : []),
    ],
  });
  if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

  if (isSuperAdmin && !req.user.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Only super admin can create super admins' });
  }

  const user = await User.create({
    fullName,
    email: email?.toLowerCase(),
    phone,
    password,
    role: 'admin',
    adminRole: isSuperAdmin ? undefined : adminRole,
    isSuperAdmin: !!isSuperAdmin && req.user.isSuperAdmin,
  });

  const populated = await User.findById(user._id).select('-password').populate('adminRole');
  res.status(201).json({ success: true, data: populated });
});

const updateAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'admin') {
    return res.status(404).json({ success: false, message: 'Admin user not found' });
  }

  if (user.isSuperAdmin && !req.user.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Cannot edit super admin' });
  }

  const { fullName, email, phone, password, adminRole, isActive, isSuperAdmin } = req.body;
  if (fullName) user.fullName = fullName;
  if (email) user.email = email.toLowerCase();
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password;
  if (adminRole !== undefined) user.adminRole = adminRole || null;
  if (isActive !== undefined) user.isActive = isActive;
  if (isSuperAdmin !== undefined && req.user.isSuperAdmin) user.isSuperAdmin = isSuperAdmin;

  await user.save();
  const populated = await User.findById(user._id).select('-password').populate('adminRole');
  res.json({ success: true, data: populated });
});

const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'admin') {
    return res.status(404).json({ success: false, message: 'Admin user not found' });
  }
  if (user.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'Cannot delete super admin' });
  }
  if (String(user._id) === String(req.user._id)) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }

  await user.deleteOne();
  res.json({ success: true, message: 'Admin user deleted' });
});

const getMobileUsers = asyncHandler(async (req, res) => {
  const filter = { role: { $in: ['coach', 'team'] } };
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter)
    .select('-password')
    .populate('team coach')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

const createMobileUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role, team, coach } = req.body;

  if (!fullName || !password || !role || !['coach', 'team'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile user data' });
  }
  if (!email && !phone) {
    return res.status(400).json({ success: false, message: 'Email or phone required' });
  }

  const exists = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase() }] : []),
      ...(phone ? [{ phone }] : []),
    ],
  });
  if (exists) return res.status(400).json({ success: false, message: 'User already exists' });

  const user = await User.create({
    fullName,
    email: email?.toLowerCase(),
    phone,
    password,
    role,
    team: role === 'team' ? team : undefined,
    coach: role === 'coach' ? coach : undefined,
  });

  const populated = await User.findById(user._id).select('-password').populate('team coach');
  res.status(201).json({ success: true, data: populated });
});

const updateMobileUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !['coach', 'team'].includes(user.role)) {
    return res.status(404).json({ success: false, message: 'Mobile user not found' });
  }

  const { fullName, email, phone, password, role, team, coach, isActive } = req.body;
  if (fullName) user.fullName = fullName;
  if (email) user.email = email.toLowerCase();
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password;
  if (isActive !== undefined) user.isActive = isActive;
  if (role && ['coach', 'team'].includes(role)) user.role = role;
  if (team !== undefined) user.team = team || null;
  if (coach !== undefined) user.coach = coach || null;

  await user.save();
  const populated = await User.findById(user._id).select('-password').populate('team coach');
  res.json({ success: true, data: populated });
});

const deleteMobileUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !['coach', 'team'].includes(user.role)) {
    return res.status(404).json({ success: false, message: 'Mobile user not found' });
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = {
  getPermissions,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getMobileUsers,
  createMobileUser,
  updateMobileUser,
  deleteMobileUser,
};
