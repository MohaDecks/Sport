const AdminRole = require('../models/AdminRole');
const { DEFAULT_ROLES, sanitizePermissions } = require('../constants/defaultRoles');

const seedDefaultRoles = async () => {
  const roles = {};

  for (const roleDef of DEFAULT_ROLES) {
    const data = {
      description: roleDef.description,
      permissions: sanitizePermissions(roleDef.permissions),
      isSystem: !!roleDef.isSystem,
      isActive: true,
    };

    const existing = await AdminRole.findOne({ name: roleDef.name });
    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      roles[roleDef.name] = existing;
    } else {
      roles[roleDef.name] = await AdminRole.create({ name: roleDef.name, ...data });
    }
  }

  return roles;
};

module.exports = { seedDefaultRoles };
