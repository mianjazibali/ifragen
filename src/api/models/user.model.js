const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { omitBy, isNil, omit } = require('lodash');
const bcrypt = require('bcryptjs');
const moment = require('moment-timezone');
const jwt = require('jwt-simple');
const APIError = require('../errors/api-error');
const { env, jwtSecret, jwtExpirationInterval } = require('../../config/vars');
const { ERRORS } = require('../../constants/user.constant');

/**
* User Roles
*/
const roles = ['USER', 'ADMIN'];

/**
 * User Schema
 * @private
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxLength: 128,
  },
  name: {
    type: String,
    required: true,
    maxLength: 128,
    index: true,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'USER',
  },
  picture: {
    type: String,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  versionKey: false,
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
userSchema.method({
  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {

  roles,

  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async get(id) {
    let user;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await this.findById(id).exec();
    }
    if (user) {
      return user;
    }

    throw new APIError({
      message: 'User does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken({ email, password, refreshObject } = {}) {
    const user = await this.findOne({ email }).exec();
    if (!user.isVerified) {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: ERRORS.LOGIN.EMAIL_NOT_VERIFIED,
      });
    }

    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }

      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: ERRORS.LOGIN.INCORRECT_EMAIL_PASSWORD,
      });
    }

    if (refreshObject && refreshObject.userEmail === email) {
      if (moment(refreshObject.expires).isBefore()) {
        throw new APIError({
          status: httpStatus.UNAUTHORIZED,
          message: ERRORS.LOGIN.INVALID_REFRESH_TOKEN,
        });
      }

      return { user, accessToken: user.token() };
    }

    const message = ERRORS.LOGIN.INCORRECT_EMAIL_OR_REFRESH_TOKEN;
    throw new APIError({ status: httpStatus.UNAUTHORIZED, message });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   *
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({
    page = 1, perPage = 30, name, email, role,
  }) {
    const options = omitBy({ name, email, role }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          messages: ['"email" already exists'],
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
};

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => omit(ret, ['_id', 'password', 'isVerified', 'updatedAt']),
});

/**
 * @typedef User
 */
module.exports = mongoose.model('User', userSchema);
