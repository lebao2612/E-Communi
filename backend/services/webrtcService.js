const twilio = require('twilio');
const { createHttpError } = require('../utils/errorHelpers');

const getIceServers = async () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw createHttpError('Twilio credentials are not configured on server', 500);
  }

  try {
    const client = twilio(accountSid, authToken);
    const token = await client.tokens.create();

    return { iceServers: token.iceServers || [] };
  } catch (error) {
    throw createHttpError('Failed to get ICE servers from Twilio', 500);
  }
};

module.exports = {
  getIceServers,
};
