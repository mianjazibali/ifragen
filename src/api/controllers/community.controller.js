const CommunityHelper = require('../helpers/community.helper');

exports.list = async (req, res, next) => {
  try {
    const { page, perPage, name } = req.query;
    const communities = await CommunityHelper.fetchAllCommunities(
      { page: parseInt(page, 10), perPage: parseInt(perPage, 10) }, { name },
    );
    return res.json({ communities });
  } catch (error) {
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { user: { _id: userId }, body: { name, description, isPublic } } = req;
    const community = await CommunityHelper.createCommunity({
      name, description, isPublic, userId,
    });
    return res.json({ community });
  } catch (error) {
    return next(error);
  }
};
