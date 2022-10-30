const Community = require('../models/community.model');

// eslint-disable-next-line arrow-body-style
const fetchAllCommunities = ({ page = 1, perPage = 30 }, { name = '' } = {}) => {
  return Community.find({ name: { $regex: name } }, { users: 0 })
    .sort({ name: 1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();
};

const createCommunity = async ({
  name, description, isPublic, userId,
}) => {
  const community = new Community({
    name, description, isPublic, users: [{ userId, role: 'ADMIN' }],
  });
  await community.save();
  return community.transform();
};

module.exports = { fetchAllCommunities, createCommunity };
