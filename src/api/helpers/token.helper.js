const { isEmpty } = require('lodash');
const moment = require('moment-timezone');
const httpStatus = require('http-status');
const Token = require('../models/token.model');
const APIError = require('../errors/api-error');
const ErrorHelper = require('./error.helper');
const { ERRORS } = require('../../constants/token.constant');

const findToken = async ({ token }, { type = Token.types.VERIFICATION } = {}) => {
  const _token = await Token.findOne({ token, type }).exec();

  if (isEmpty(_token)) {
    const message = ERRORS[type].INVALID;
    throw new APIError(ErrorHelper.getErrorObject({ status: httpStatus.UNAUTHORIZED, message }));
  }

  if (moment().isAfter(_token.expires)) {
    const message = ERRORS[type].EXPIRED;
    throw new APIError(ErrorHelper.getErrorObject({ status: httpStatus.UNAUTHORIZED, message }));
  }

  return _token;
};

module.exports = { findToken };
