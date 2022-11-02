const _ = require('lodash');
const httpStatus = require('http-status');

const APIError = require('../errors/api-error');
const Community = require('../models/community.model');
const { ERRORS } = require('../constants/community.constant');

exports.load = async (req, res, next) => {
  try {
    const { communityId } = req.params;
    const _community = await Community.get({ communityId });
    const community = await _community.denormalize();
    req.locals = { community };
    return next();
  } catch (error) {
    return next(error);
  }
};

exports.canUpdate = async (req, res, next) => {
  try {
    const { locals: { community }, user: { id: userId } } = req;
    const canUpdate = _.find(community.users, { id: userId, role: 'ADMIN' });

    if (!canUpdate) {
      throw new APIError({
        status: httpStatus.FORBIDDEN, message: ERRORS.PUT.INSUFFICIENT_PERMISSION,
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
