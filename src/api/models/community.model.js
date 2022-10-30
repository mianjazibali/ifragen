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
});

communitySchema.method({
  async transform() {
    const usersMap = _.keyBy(this.users, 'userId');
    const users = await User.find({ _id: { $in: _.keys(usersMap) } });

    const communities = this.toJSON();
    communities.users = _.map(users, (user) => _.assign(user.transform(), { role: _.get(usersMap, [user._id, 'role']) }));

    const fields = ['id', 'name', 'description', 'users', 'picture', 'isPublic'];
    return _.pick(communities, fields);
  },
});

communitySchema.statics = {
  communityRoles,
};

module.exports = mongoose.model('Community', communitySchema);
