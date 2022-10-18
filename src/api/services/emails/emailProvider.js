const { toLower } = require('lodash');
const Email = require('email-templates');
const nodemailer = require('nodemailer');

const { emailConfig } = require('../../../config/vars');
const { types: { VERIFICATION } } = require('../../models/token.model');

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

exports.sendEmail = async ({ to, locals }, { template = VERIFICATION } = {}) => {
  const email = new Email({
    views: { root: __dirname },
    message: {
      from: emailConfig.username,
    },
    send: true,
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
