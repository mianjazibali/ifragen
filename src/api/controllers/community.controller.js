const CommunityHelper = require('../helpers/community.helper');

exports.list = async (req, res, next) => {
  try {
    const { page, perPage, name } = req.query;
    const communities = await CommunityHelper.fetchAllCommunities({
      page: parseInt(page, 10), perPage: parseInt(perPage, 10), name,
    });
    return res.json({ communities });
  } catch (error) {
    return next(error);
  }
};

exports.get = (req, res) => res.json(req.locals.community);

exports.create = async (req, res, next) => {
  try {
    const { user: { _id }, body: { name, description, isPublic }, file } = req;
    const community = await CommunityHelper.createCommunity({
      name, description, picture: file && file.filename, isPublic, userId: _id,
    });
    return res.json({ community });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { locals: { community }, body: { name, description, isPublic }, file } = req;
    const _community = await CommunityHelper.updateCommunity({
      communityId: community.id,
    }, {
      name, description, picture: file, isPublic,
    });
    return res.json({ community: _community });
  } catch (error) {
    return next(error);
  }
};
