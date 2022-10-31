const Community = require('../models/community.model');

// eslint-disable-next-line arrow-body-style
const fetchAllCommunities = ({ page = 1, perPage = 30, name = '' } = {}) => {
  return Community.find({ name: { $regex: name } }, { users: 0, updatedAt: 0 })
    .sort({ name: 1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();
};

const getCommunity = async ({ communityId }) => {
  const community = await Community.findOne({ _id: communityId }).exec();
  return community.denormalize();
};

const createCommunity = async ({
  name, description, picture = '', isPublic, userId,
}) => {
  const community = new Community({
    name, description, picture, isPublic, users: [{ userId, role: 'ADMIN' }],
  });
  await community.save();
  return community.denormalize();
};

module.exports = { fetchAllCommunities, getCommunity, createCommunity };
