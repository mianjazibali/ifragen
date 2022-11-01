const Community = require('../models/community.model');

// eslint-disable-next-line arrow-body-style
const fetchAllCommunities = ({ page = 1, perPage = 30, name = '' } = {}) => {
  return Community.find({ name: { $regex: name } }, { users: 0, updatedAt: 0 })
    .sort({ name: 1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();
};

const getCommunity = async ({ communityId }) => Community.findOne({ _id: communityId }).exec();

const createCommunity = async ({
  name, description, picture, isPublic, userId,
}) => {
  const community = new Community({
    name, description, picture, isPublic, users: [{ userId, role: 'ADMIN' }],
  });
  return community.save();
};

module.exports = { fetchAllCommunities, getCommunity, createCommunity };
