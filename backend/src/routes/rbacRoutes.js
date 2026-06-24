const express = require('express');
const {
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
} = require('../controllers/rbacController');
const { protect, authorize, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/permissions', requirePermission('roles.view', 'roles.manage'), getPermissions);
router.get('/roles', requirePermission('roles.view', 'roles.manage'), getRoles);
router.post('/roles', requirePermission('roles.manage'), createRole);
router.put('/roles/:id', requirePermission('roles.manage'), updateRole);
router.delete('/roles/:id', requirePermission('roles.manage'), deleteRole);

router.get('/admins', requirePermission('users.admins.view', 'users.admins.manage'), getAdminUsers);
router.post('/admins', requirePermission('users.admins.manage'), createAdminUser);
router.put('/admins/:id', requirePermission('users.admins.manage'), updateAdminUser);
router.delete('/admins/:id', requirePermission('users.admins.manage'), deleteAdminUser);

router.get('/mobile-users', requirePermission('users.mobile.view', 'users.mobile.manage'), getMobileUsers);
router.post('/mobile-users', requirePermission('users.mobile.manage'), createMobileUser);
router.put('/mobile-users/:id', requirePermission('users.mobile.manage'), updateMobileUser);
router.delete('/mobile-users/:id', requirePermission('users.mobile.manage'), deleteMobileUser);

module.exports = router;
