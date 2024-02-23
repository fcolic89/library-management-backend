const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

const generateToken = (id, username, role, canComment, takeBook) => jwt.sign({
  id,
  username,
  role,
  canComment,
  takeBook,
}, JWT_SECRET);

const isValidId = (id) => {
  if (!id) {
    return false;
  }
  return !!id.toString().match(/^[0-9a-fA-F]{24}$/);
};

module.exports = {
  generateToken,
  isValidId,
};
