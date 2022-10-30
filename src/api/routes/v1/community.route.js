const express = require('express');
const validate = require('express-validation');

const Controller = require('../../controllers/community.controller');
const Validation = require('../../validations/community.validation');
const { authorize, LOGGED_USER } = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(authorize(LOGGED_USER), validate(Validation.listCommunities), Controller.list)
  .post(authorize(LOGGED_USER), validate(Validation.createCommunity), Controller.create);

module.exports = router;
