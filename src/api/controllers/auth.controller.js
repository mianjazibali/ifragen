const { omit } = require('lodash');
const httpStatus = require('http-status');
const moment = require('moment-timezone');

const User = require('../models/user.model');
const Token = require('../models/token.model');
const APIError = require('../errors/api-error');

const AuthHelper = require('../helpers/auth.helper');
const ResponseHelper = require('../helpers/response.helper');

exports.register = async (req, res, next) => {
  try {
    const userData = omit(req.body, 'role');
    const user = await AuthHelper.registerUser({ userData });
    return res.status(httpStatus.CREATED).json({ user });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken } = await User.findAndGenerateToken({ email, password });
    const token = await ResponseHelper.generateTokenResponse({ user, accessToken });
    return res.json({ token, user: user.transform() });
  } catch (error) {
    return next(error);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const { token } = req.params;
    const isVerified = await AuthHelper.verifyUser({ token });
    return res.json({ isVerified });
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const refreshObject = await Token.findOneAndRemove({
      userEmail: email,
      token,
    });
    const { user, accessToken } = await User.findAndGenerateToken({ email, refreshObject });
    const response = await ResponseHelper.generateTokenResponse({ user, accessToken });
    return res.json(response);
  } catch (error) {
    return next(error);
  }
};

exports.sendPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();

    if (user) {
      // const passwordResetObj = await Token.generate(user, { tokenType: Token.types.RESET });
      // emailProvider.sendPasswordReset(passwordResetObj);
      res.status(httpStatus.OK);
      return res.json('success');
    }
    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'No account found with that email',
    });
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, token } = req.body;
    const resetTokenObject = await Token.findOneAndRemove({
      userEmail: email, token, type: Token.types.RESET,
    });

    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true,
    };
    if (!resetTokenObject) {
      err.message = 'Cannot find matching reset token';
      throw new APIError(err);
    }
    if (moment().isAfter(resetTokenObject.expires)) {
      err.message = 'Reset token is expired';
      throw new APIError(err);
    }

    const user = await User.findOne({ email: resetTokenObject.userEmail }).exec();
    user.password = password;
    await user.save();
    // emailProvider.sendPasswordChangeEmail(user);

    res.status(httpStatus.OK);
    return res.json('Password Updated');
  } catch (error) {
    return next(error);
  }
};
