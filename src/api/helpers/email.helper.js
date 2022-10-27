const Path = require('path');
const { toLower } = require('lodash');
const Email = require('email-templates');
const nodemailer = require('nodemailer');

const { emailConfig } = require('../../config/vars');
const { types: { VERIFICATION } } = require('../models/token.model');

const UrlHelper = require('./url.helper');

const transporter = nodemailer.createTransport({
  port: emailConfig.port,
  host: emailConfig.host,
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
  secure: true,
});

transporter.verify((error) => {
  if (error) {
    console.log('error with email connection');
  }
});

const sendEmail = async ({ to, locals }, { template = VERIFICATION } = {}) => {
  const email = new Email({
    views: { root: Path.join(__dirname, '../views/emails') },
    message: {
      from: emailConfig.username,
    },
    send: false,
    transport: transporter,
  });

  email
    .send({
      template: toLower(template),
      message: { to },
      locals,
    })
    .catch(() => console.log('Error Sending Email'));
};

const sendVerificationEmail = ({ name, email, token }) => {
  sendEmail({
    to: email,
    locals: {
      userName: name, actionUrl: UrlHelper.getVerificationUrl({ token }),
    },
  });
};

module.exports = { sendVerificationEmail };
