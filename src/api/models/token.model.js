const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment-timezone');

const { CONSTANTS: { TYPES } } = require('../../constants/token.constant');

const types = {
  REFRESH: 'REFRESH',
  RESET: 'RESET',
  VERIFICATION: 'VERIFICATION',
};

const token = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: types,
    default: 'REFRESH',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: {
    type: 'String',
    ref: 'User',
    required: true,
  },
  expires: { type: Date },
}, {
  versionKey: false,
});

token.statics = {
  types,

  async generate({ _id: userId, email: userEmail }, { tokenType = types.REFRESH } = {}) {
    const _token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = moment().add(TYPES[tokenType].VALIDITY, TYPES[tokenType].UNIT).toDate();
    const ResetTokenObject = new Token({
      userId, userEmail, token: _token, type: tokenType, expires,
    });
    await ResetTokenObject.save();
    return ResetTokenObject;
  },
};

const Token = mongoose.model('Token', token);
module.exports = Token;
