const express = require('express');

const router = express.Router();
const bookService = require('../service/book');
const { regular, librarian } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const error = require('../middleware/errorHandling/errorConstants');
const { catchAsyncError } = require('../middleware/errorHandling/functionErrorHandler');
const {
  bookSchema, updateBookSchema, commentSchema,
} = require('./joi');

router.post('/', [authentication, authorization(librarian)], (req, res, next) => {
  const { error: validationError } = bookSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(bookService.saveBook));

router.delete('/:id', [authentication, authorization(librarian)], catchAsyncError(bookService.deleteBook));

router.get('/find/:id', [authentication, authorization(regular, librarian)], catchAsyncError(bookService.findBookById));

router.get('/filter', [authentication, authorization(regular, librarian)], catchAsyncError(bookService.filterBooks));

router.put('/', [authentication, authorization(librarian)], (req, res, next) => {
  const { error: validationError } = updateBookSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(bookService.updateBook));

router.post('/comment/:bookId', [authentication, authorization(librarian, regular)], (req, res, next) => {
  const { error: validationError } = commentSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(bookService.addComment));

router.put('/comment/:commentId', [authentication, authorization(librarian, regular)], (req, res, next) => {
  const { error: validationError } = commentSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(bookService.editComment));

router.get('/comment/:bookId', [authentication, authorization(librarian, regular)], catchAsyncError(bookService.findComments));

router.get('/genre', [authentication, authorization(librarian, regular)], catchAsyncError(bookService.getGenre));

router.post('/genre', [authentication, authorization(librarian)], (req, res, next) => {
  if (!req.body.name) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(bookService.addGenre));

router.delete('/genre/:name', [authentication, authorization(librarian)], catchAsyncError(bookService.deleteGenre));

module.exports = router;
