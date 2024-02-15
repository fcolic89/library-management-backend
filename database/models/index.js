const Book = require('./bookModel');
const { Checkout, checkoutStatus } = require('./checkOutModel');
const { User, userRoles } = require('./userModel');
const Genre = require('./genreModel');
const Comment = require('./commentModel');

module.exports = {
  Book,
  Checkout,
  checkoutStatus,
  User,
  userRoles,
  Genre,
  Comment,
};
