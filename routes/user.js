const express = require('express');

const router = express.Router();
const userService = require('../service/user');
const { regular, librarian, admin } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const { registerSchema, updateUserSchema, changePrivSchema } = require('./joi');
const { catchAsyncError } = require('../middleware/errorHandling/functionErrorHandler');
const error = require('../middleware/errorHandling/errorConstants');

router.post('/register', (req, res, next) => {
  const { error: validationError } = registerSchema.validate(req.body);
  if (validationError || (req.body.role && req.body.role !== regular)) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.registerUser));

router.post('/add', [authentication, authorization(admin)], (req, res, next) => {
  const { error: validationError } = registerSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.addUser));

router.delete('/:id', [authentication, authorization(admin)], (req, res, next) => {
  if (!req.params.id) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.deleteUser));

router.put('/', [authentication, authorization(admin, librarian, regular)], (req, res, next) => {
  const result = updateUserSchema.validate(req.body);
  if (result.error) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.updateUser));

router.get('/find', [authentication, authorization(admin, librarian)], catchAsyncError(userService.findUser));

router.get('/findRegular', [authentication, authorization(librarian)], (req, res, next) => {
  req.query.role = 'REGULAR,';
  next();
}, catchAsyncError(userService.findUser));

router.put('/pwd-change', [authentication, authorization(admin, librarian, regular)], (req, res, next) => {
  if (!req.body.password) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.changePassword));

router.get('/profile', [authentication, authorization(admin, librarian, regular)], catchAsyncError(userService.getUserInformation));

router.put('/priv/comment', [authentication, authorization(admin)], (req, res, next) => {
  const { error: validationError } = changePrivSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.changeCommentPriv));

router.put('/priv/book', [authentication, authorization(admin)], (req, res, next) => {
  const { error: validationError } = changePrivSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(userService.changeTakeBookPriv));

module.exports = router;
