const jwt = require('jsonwebtoken');
const { User } = require('../database/models');
const error = require('./errorHandling/errorConstants');

const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

const authentication = (req, res, next) => {
  // Authorization: Bearer <token>
  const auth = req.header('Authorization');
  if (!auth) return res.status(401).json({ message: 'Access denied. No token provided!' });

  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided!' });

  try {
    const decoded = jwt.verify(token, privateKey);
    req.tmp = { id: decoded.id };
    next();
  } catch (err) {
    console.log(err);
    throw new Error(error.UNAUTHORIZED_ERROR);
  }
};

const authorization = (...roles) => async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.tmp.id }).lean();
    if (!user) return res.status(401).json({ message: 'Access denied. User does not exist!' });

    if (!roles.includes(user.role)) return res.status(401).json({ message: 'Access denied. User does not have permission for this resource!' });

    req.user = user;
    delete req.tmp;

    next();
  } catch (err) {
    throw new Error();
  }
};
module.exports = {
  authentication,
  authorization,
};
