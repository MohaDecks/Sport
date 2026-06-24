const EXPO_PUSH_URL =
  process.env.EXPO_PUSH_URL || 'https://exp.host/--/api/v2/push/send';

const sendExpoPush = async (tokens, title, body, data = {}) => {
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];
  if (!uniqueTokens.length) return;

  const messages = uniqueTokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Expo push failed:', error);
  }
};

module.exports = { sendExpoPush };
