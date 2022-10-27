const getVerificationUrl = ({ token }) => `http://localhost:3000/v1/auth/verify/${token}`;

module.exports = { getVerificationUrl };
