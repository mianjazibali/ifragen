const Joi = require('joi');

module.exports = {

  // GET /v1/communities
  listCommunities: {
    query: {
      page: Joi.number().min(1),
      perPage: Joi.number().min(1).max(100),
      name: Joi.string().max(128),
    },
  },

  // POST /v1/communities
  createCommunity: {
    body: {
      name: Joi.string().max(128),
      description: Joi.string(),
      isPublic: Joi.boolean(),
    },
  },
};
