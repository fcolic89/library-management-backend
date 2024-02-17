const errorMessage = require('./errorConstants');

module.exports = () => (err, req, res, next) => {
  const error = {};

  switch (err.message) {
  case errorMessage.AUTHORIZATION_TOKEN:
    error.message = 'No authorization token was found';
    error.status = 401;
    error.errorCode = 1;
    break;
  case errorMessage.MISSING_PARAMETERS:
    error.message = 'Missing parameters';
    error.status = 400;
    error.errorCode = 2;
    break;
  case errorMessage.NOT_ACCEPTABLE:
    error.status = 406;
    error.message = 'Not acceptable';
    error.errorCode = 3;
    break;
  case errorMessage.NOT_FOUND:
    error.status = 404;
    error.message = 'Not Found';
    error.errorCode = 4;
    break;
  case errorMessage.FORBIDDEN:
    error.status = 403;
    error.message = 'Insufficient privileges';
    error.errorCode = 5;
    break;
  case errorMessage.INVALID_VALUE:
    error.status = 400;
    error.message = 'Value is not valid';
    error.errorCode = 6;
    break;
  case errorMessage.BAD_REQUEST:
    error.status = 400;
    error.message = 'Bad Request';
    error.errorCode = 7;
    break;
  case errorMessage.CREDENTIALS_ERROR:
    error.status = 401;
    error.message = 'Wrong credentials';
    error.errorCode = 8;
    break;
  case errorMessage.INVALID_EMAIL:
    error.status = 400;
    error.message = 'Please fill a valid email address';
    error.errorCode = 9;
    break;
  case errorMessage.DUPLICATE_EMAIL:
    error.status = 406;
    error.message = 'This email address is already registered';
    error.errorCode = 10;
    break;
  case errorMessage.UNAUTHORIZED_ERROR:
    error.status = 401;
    error.message = 'Invalid credentials';
    error.errorCode = 11;
    break;
  case errorMessage.DUPLICATE_USERNAME:
    error.status = 401;
    error.message = 'This username is already registered';
    error.errorCode = 12;
    break;
  case errorMessage.DELETE_USER_UNRETURNED:
    error.status = 401;
    error.message = 'Cannot delete user! User still has unreturned books.';
    error.errorCode = 13;
    break;
  case errorMessage.CANT_CHANGE_ADMIN:
    error.status = 406;
    error.message = 'Cant change admin privileges.';
    error.errorCode = 14;
    break;
  case errorMessage.USER_UPDATE_FAIL:
    error.status = 500;
    error.message = 'Failed to update user.';
    error.errorCode = 15;
    break;
  case errorMessage.COPIES_CHECKED_OUT:
    error.status = 400;
    error.message = 'Cant delete book, there are still copies that are checked out.';
    error.errorCode = 16;
    break;
  case errorMessage.NO_COPIES_LEFT:
    error.status = 409;
    error.message = 'No more copies available!';
    error.errorCode = 17;
    break;
  case errorMessage.CHECKOUT_OVERDUE:
    error.status = 403;
    error.message = 'Cannot chekout a book while an overdue book is not retured!';
    error.errorCode = 18;
    break;
  case errorMessage.CHECKOUT_OR_RESERVED:
    error.status = 403;
    error.message = 'Book is already checked out or reserved by user!';
    error.errorCode = 19;
    break;
  default:
    error.status = 500;
    error.message = 'Oops, an error occurred';
    error.errorCode = 0;
  }

  if (error.status === 500) {
    error.stack = err.stack;
  }

  return res.status(error.status).send(error);
};
