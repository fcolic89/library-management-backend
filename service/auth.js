const bcrypt = require('bcrypt');
const { User } = require('../database/models');
const error = require('../middleware/errorHandling/errorConstants');
const { generateToken } = require('../lib/misc');

const login = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new Error(error.NOT_FOUND);
  }

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) {
    throw new Error(error.CREDENTIALS_ERROR);
  }

  const token = generateToken(
    user._id,
    user.username,
    user.role,
    user.canComment,
    user.takeBook,
  );
  return res.json({ jwt: token });
};

module.exports = {
  login,
  generateToken,
};
