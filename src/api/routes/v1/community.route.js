const express = require('express');
const validate = require('express-validation');

const CommunityController = require('../../controllers/community.controller');
const FileController = require('../../controllers/file.controller');
const Validation = require('../../validations/community.validation');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');
const CommunityMiddleware = require('../../middlewares/community');

const router = express.Router();

router.param('communityId', CommunityMiddleware.load);

router
  .route('/')
  .all(authorize(LOGGED_USER))
  .get(validate(Validation.listCommunities), CommunityController.list)
  .post(
    validate(Validation.createCommunity),
    FileController.uploadImage, CommunityController.create,
  );

router
  .route('/:communityId')
  .all(authorize(LOGGED_USER))
  .get(CommunityController.get)
  .put(CommunityMiddleware.canUpdate, CommunityController.update);

module.exports = router;
