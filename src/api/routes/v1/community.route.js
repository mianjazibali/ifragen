const express = require('express');
const validate = require('express-validation');

const CommunityController = require('../../controllers/community.controller');
const FileController = require('../../controllers/file.controller');
const Validation = require('../../validations/community.validation');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router.param('communityId', CommunityController.load);

router
  .route('/')
  .get(authorize(LOGGED_USER), validate(Validation.listCommunities), CommunityController.list)
  .post(
    authorize(LOGGED_USER),
    validate(Validation.createCommunity),
    FileController.uploadImage, CommunityController.create,
  );

router
  .route('/:communityId')
  .get(authorize(LOGGED_USER), CommunityController.get);

module.exports = router;
