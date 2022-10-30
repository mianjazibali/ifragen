const _ = require('lodash');
const mongoose = require('mongoose');

const User = require('./user.model');

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

    const communities = _.omit(this.toJSON(), ['updatedAt']);
    communities.users = _.map(users, (user) => _.assign(user, { role: _.get(usersMap, [user._id, 'role']) }));
    return communities;
  },
});

communitySchema.statics = {
  communityRoles,
};

communitySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => _.omit(ret, ['_id', 'updatedAt']),
});

module.exports = mongoose.model('Community', communitySchema);
