const httpStatus = require('http-status');

const Token = require('../models/token.model');
const User = require('../models/user.model');

const TokenHelper = require('./token.helper');
const EmailHelper = require('./email.helper');
const APIError = require('../errors/api-error');
const ErrorHelper = require('./error.helper');
const { ERRORS } = require('../../constants/user.constant');

const registerUser = async ({ userData }) => {
  const user = await new User(userData).save();
  const { token } = await Token.generate(user, { tokenType: Token.types.VERIFICATION });
  EmailHelper.sendVerificationEmail({ name: user.name, email: user.email, token });
  return user.transform();
};

const isUserVerified = async ({ userId }) => {
  const user = await User.findOne({ _id: userId });
  return user.isVerified;
};

const verifyUser = async ({ token }) => {
  const _token = await TokenHelper.findToken({ token });
  const isVerified = await isUserVerified({ userId: _token.userId });
  if (isVerified) {
    const message = ERRORS.VERIFICATION.VERIFIED;
    throw new APIError(ErrorHelper.getErrorObject({ status: httpStatus.BAD_REQUEST, message }));
  }
  await User.updateOne({ _id: _token.userId }, { isVerified: true });
  return !!_token;
};

module.exports = { registerUser, verifyUser };
