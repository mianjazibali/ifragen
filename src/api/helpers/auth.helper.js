const moment = require('moment-timezone');
const { isEmpty } = require('lodash');
const httpStatus = require('http-status');

const User = require('../models/user.model');
const Token = require('../models/token.model');
const APIError = require('../errors/api-error');

const EmailHelper = require('./email.helper');

const { ERRORS: USER_ERRORS } = require('../constants/user.constant');
const { ERRORS: TOKEN_ERRORS } = require('../constants/token.constant');

const registerUser = async ({ userData }) => {
  const user = await new User(userData).save();
  const { token } = await Token.generate(user, { tokenType: Token.types.VERIFICATION });
  EmailHelper.sendVerificationEmail({ name: user.name, email: user.email, token });
  return user;
};

const verifyToken = ({ token, ERROR_TYPE }) => {
  if (!token) {
    throw new APIError({ status: httpStatus.BAD_REQUEST, message: ERROR_TYPE.INVALID });
  }

  if (moment().isAfter(token.expires)) {
    throw new APIError({ status: httpStatus.UNAUTHORIZED, message: ERROR_TYPE.EXPIRED });
  }

  return true;
};

const verifyUser = async ({ token }) => {
  const _token = await Token.findOneAndRemove({ token, type: Token.types.VERIFICATION });
  verifyToken({ token: _token, ERROR_TYPE: TOKEN_ERRORS.VERIFICATION });
  return User.updateOne({ _id: _token.userId }, { isVerified: true });
};

const sendPasswordReset = async ({ email }) => {
  const user = await User.findOne({ email }).exec();

  if (isEmpty(user)) {
    throw new APIError({
      status: httpStatus.NOT_FOUND, message: USER_ERRORS.PASSWORD_RESET.ACCOUNT_NOT_FOUND,
    });
  }

  const { token } = await Token.generate(user, { tokenType: Token.types.RESET });
  return EmailHelper.sendPasswordResetEmail({ name: user.name, email: user.email, token });
};

const resetPassword = async ({ email, password, token }) => {
  const _token = await Token.findOneAndRemove({ userEmail: email, token, type: Token.types.RESET });
  verifyToken({ token: _token, ERROR_TYPE: TOKEN_ERRORS.RESET });

  const user = await User.findOne({ email: _token.userEmail }).exec();
  user.password = password;
  await user.save();

  await EmailHelper.sendPasswordChangeEmail({ name: user.name, email: user.email });
  return user;
};

module.exports = {
  registerUser, verifyUser, sendPasswordReset, resetPassword,
};
