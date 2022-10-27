const moment = require('moment-timezone');

const Token = require('../models/token.model');
const Vars = require('../../config/vars');

const generateTokenResponse = async ({ user, accessToken }) => {
  const tokenType = 'Bearer';
  const { token: refreshToken } = await Token.generate(user);
  const expiresIn = moment().add(Vars.jwtExpirationInterval, 'minutes');
  return {
    tokenType, accessToken, refreshToken, expiresIn,
  };
};

module.exports = { generateTokenResponse };
