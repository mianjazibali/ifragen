const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/user.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const Validation = require('../../validations/user.validation');

const router = express.Router();

router.param('userId', controller.load);

router
  .route('/')
  .get(authorize(ADMIN), validate(Validation.listUsers), controller.list)
  .post(authorize(ADMIN), validate(Validation.createUser), controller.create);

router.route('/profile').get(authorize(), controller.loggedIn);

router
  .route('/:userId')
  .get(authorize(LOGGED_USER), controller.get)
  .put(authorize(LOGGED_USER), validate(Validation.replaceUser), controller.replace)
  .patch(authorize(LOGGED_USER), validate(Validation.updateUser), controller.update)
  .delete(authorize(LOGGED_USER), controller.remove);

module.exports = router;
