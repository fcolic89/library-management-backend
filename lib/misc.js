const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');

const generateToken = (id, username, role, canComment, takeBook) => jwt.sign({
  id,
  username,
  role,
  canComment,
  takeBook,
}, JWT_SECRET);

module.exports = {
  generateToken,
};
