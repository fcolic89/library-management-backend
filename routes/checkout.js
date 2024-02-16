const express = require('express');

const router = express.Router();
const checkoutService = require('../service/checkout');
const { regular, librarian } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const { checkoutBookSchema, returnBookSchema } = require('./joi');
const { catchAsyncError } = require('../middleware/errorHandling/functionErrorHandler');
const error = require('../middleware/errorHandling/errorConstants');

router.post('/', [authentication, authorization(librarian)], (req, res, next) => {
  const { error: validationError } = checkoutBookSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(checkoutService.checkoutBook));

router.post('/reserve', [authentication, authorization(regular)], (req, res, next) => {
  if (!req.body.bookId) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(checkoutService.reserveBook));

router.put('/return', [authentication, authorization(librarian)], (req, res, next) => {
  const { error: validationError } = returnBookSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(checkoutService.returnBook));

router.get('/', [authentication, authorization(librarian)], catchAsyncError(checkoutService.findCheckouts));

router.get('/fines', [authentication, authorization(librarian)], catchAsyncError(checkoutService.agregateFines));

router.get('/user/:username', [authentication, authorization(librarian)], catchAsyncError(checkoutService.userCheckouts));

router.get('/book/:bookId', [authentication, authorization(librarian)], catchAsyncError(checkoutService.bookCheckouts));

router.get('/self', [authentication, authorization(regular)], catchAsyncError(checkoutService.myCheckouts));

module.exports = router;
