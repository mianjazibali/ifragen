const _ = require('lodash');
const mongoose = require('mongoose');
const httpStatus = require('http-status');

const User = require('./user.model');
const APIError = require('../errors/api-error');

const { CONSTANTS, ERRORS } = require('../constants/community.constant');

const communityRoles = ['USER', 'MODERATOR', 'ADMIN'];

const userSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    default: 'USER',
  },
}, { _id: false });

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    match: /^[a-zA-Z0-9-_ ]+$/,
    required: true,
    maxLength: 128,
    index: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  users: [userSchema],
  picture: {
    type: String,
    trim: true,
    default: CONSTANTS.IMAGE.COMMUNITY,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

communitySchema.method({
  async denormalize() {
    const usersMap = _.keyBy(this.users, 'userId');
    const users = await User.find({ _id: { $in: _.keys(usersMap) } });
    return _.assign(this.toJSON(), {
      users: _.map(users, (user) => _.assign(user, { role: _.get(usersMap, [user.id, 'role']) })),
    });
  },
});

communitySchema.statics = {
  communityRoles,

  async get({ communityId }) {
    let community;
    if (mongoose.Types.ObjectId.isValid(communityId)) {
      community = await this.findById(communityId).exec();
    }

    if (!community) {
      throw new APIError({ message: ERRORS.GET.COMMUNITY_NOT_FOUND, status: httpStatus.NOT_FOUND });
    }

    return community;
  },
};

communitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => _.omit(ret, ['_id', 'users', 'updatedAt']),
});

module.exports = mongoose.model('Community', communitySchema);
