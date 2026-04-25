const asyncHandler = require('../utils/asyncHandler');
const webrtcService = require('../services/webrtcService');

const getIceServers = asyncHandler(async (req, res) => {
  const result = await webrtcService.getIceServers();
  return res.json(result);
});

module.exports = {
  getIceServers,
};
