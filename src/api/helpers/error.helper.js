const getErrorObject = (
  { status, message }, { isPublic = true } = {},
) => ({ status, isPublic, message });

module.exports = { getErrorObject };
