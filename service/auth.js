const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../database/models');

const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).json({ message: 'Invalid email or password!' });
  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) return res.status(400).json({ message: 'Invalid email or password!' });

  const token = jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role,
    canComment: user.canComment,
    takeBook: user.takeBook,
  }, privateKey);
  res.json({ jwt: token });
};

const generateToken = (id, username, role, canComment, takeBook) => (
  jwt.sign({
    id,
    username,
    role,
    canComment,
    takeBook,
  }, privateKey));

module.exports = {
  login,
  generateToken,
};
