const twilio = require('twilio');

const getIceServers = async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return res.status(500).json({ error: 'Twilio credentials are not configured on server' });
  }

  try {
    const client = twilio(accountSid, authToken);
    const token = await client.tokens.create();

    return res.json({ iceServers: token.iceServers || [] });
  } catch (error) {
    console.error('Failed to get Twilio ICE servers:', error.message);
    return res.status(500).json({ error: 'Failed to get ICE servers from Twilio' });
  }
};

module.exports = {
  getIceServers,
};
