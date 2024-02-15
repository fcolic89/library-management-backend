const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userRoles = {
  admin: 'ADMIN',
  librarian: 'LIBRARIAN',
  regular: 'REGULAR',
};

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, enum: userRoles.values, default: userRoles.regular },
  canComment: { type: Boolean, default: true },
  takeBook: { type: Boolean, default: true },
}, { optimisticConcurrency: true });

const User = model('User', userSchema);

module.exports = {
  User,
  userRoles,
};
