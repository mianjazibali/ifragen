const express = require('express');
const validate = require('express-validation');

const Controller = require('../../controllers/auth.controller');
const Validation = require('../../validations/auth.validation');

const router = express.Router();

router
  .route('/register')
  .post(validate(Validation.register), Controller.register);

router
  .route('/login')
  .post(validate(Validation.login), Controller.login);

router
  .route('/verify/:token')
  .get(validate(Validation.verify), Controller.verify);

router
  .route('/refresh-token')
  .post(validate(Validation.refresh), Controller.refresh);

router
  .route('/send-password-reset')
  .post(validate(Validation.sendPasswordReset), Controller.sendPasswordReset);

router
  .route('/reset-password')
  .post(validate(Validation.passwordReset), Controller.resetPassword);

module.exports = router;
