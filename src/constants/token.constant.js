module.exports = {
  CONSTANTS: {
    TYPES: {
      REFRESH: {
        VALIDITY: 30,
        UNIT: 'days',
      },
      RESET: {
        VALIDITY: 2,
        UNIT: 'hours',
      },
      VERIFICATION: {
        VALIDITY: 7,
        UNIT: 'days',
      },
    },
  },

  ERRORS: {
    REFRESH: {
      INVALID: 'Invalid Refresh Token',
      EXPIRED: 'Expired Refresh Token',
    },
    RESET: {
      INVALID: 'Invalid Reset Token',
      EXPIRED: 'Expired Reset Token',
    },
    VERIFICATION: {
      INVALID: 'Invalid Verification Token',
      EXPIRED: 'Expired Verification Token',
    },
  },
};
