const User = require('../models/User');
const { sendExpoPush } = require('./pushNotifications');

const getTargetPushTokens = async ({ targetRole = 'all', targetTeam }) => {
  const filter = { isActive: true, pushToken: { $nin: ['', null] } };

  if (targetRole !== 'all') {
    filter.role = targetRole;
  }

  if (targetTeam) {
    filter.team = targetTeam;
  }

  const users = await User.find(filter).select('pushToken');
  return users.map((user) => user.pushToken).filter(Boolean);
};

const sendPushForNotification = async (notification) => {
  if (!notification?.isPush) return;

  const tokens = await getTargetPushTokens({
    targetRole: notification.targetRole,
    targetTeam: notification.targetTeam,
  });

  await sendExpoPush(tokens, notification.title, notification.message, {
    type: notification.type,
    notificationId: notification._id?.toString(),
  });
};

module.exports = { sendPushForNotification };
