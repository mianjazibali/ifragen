const path = require('path');
const { CONSTANTS: { BASE_URL } } = require('../../constants/url.constant');

const getVerificationUrl = ({ token }) => path.join(BASE_URL, 'auth', 'verify', token);

const getPasswordResetUrl = ({ token }) => path.join(BASE_URL, 'auth', 'reset-password', token);

module.exports = { getVerificationUrl, getPasswordResetUrl };
