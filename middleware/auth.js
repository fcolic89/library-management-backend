const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const error = require('./errorHandling/errorConstants');
const { JWT_SECRET } = require('../config/environment');

const authentication = (req, res, next) => {
  // Authorization: Bearer <token>
  const auth = req.header('Authorization');
  if (!auth) {
    throw new Error(error.AUTHORIZATION_TOKEN);
  }

  const token = auth.split(' ')[1];
  if (!token) {
    throw new Error(error.AUTHORIZATION_TOKEN);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.tmp = { id: decoded.id };
    next();
  } catch (err) {
    next(err);
  }
};

const authorization = (...roles) => async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.tmp.id }).lean();
    if (!user) {
      throw new Error(error.NOT_FOUND);
    }

    if (!roles.includes(user.role)) {
      throw new Error(error.FORBIDDEN);
    }

    req.user = user;
    delete req.tmp;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authentication,
  authorization,
};
