const { omit } = require('lodash');
const httpStatus = require('http-status');

const User = require('../models/user.model');
const Token = require('../models/token.model');

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
    await AuthHelper.verifyUser({ token });
    return res.json('success');
  } catch (error) {
    return next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { email, token } = req.body;
    const refreshObject = await Token.findOneAndRemove({ userEmail: email, token });
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
    await AuthHelper.sendPasswordReset({ email });
    return res.json('success');
  } catch (error) {
    return next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, password, token } = req.body;
    const user = await AuthHelper.resetPassword({ email, password, token });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
};
