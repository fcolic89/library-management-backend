const express = require('express');

const router = express.Router();
const bookService = require('../service/book');
const { regular, librarian } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const {
  bookSchema, updateBookSchema, commentSchema, replyCommentSchema,
} = require('./joi');

router.post('/', [authentication, authorization(librarian)], (req, res) => {
  const result = bookSchema.validate(req.body);
  if (result.error) {
    return res.status(400).send(result.error);
  }
  bookService.saveBook(req, res);
});

router.delete('/:id', [authentication, authorization(librarian)], (req, res) => {
  bookService.deleteBook(req, res);
});

router.get('/find/:id', (req, res) => {
  bookService.findBookById(req, res);
});

router.get('/filter', (req, res) => {
  bookService.filterBooks(req, res);
});

router.put('/', [authentication, authorization(librarian)], (req, res) => {
  const { error } = updateBookSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input!', error });
  bookService.updateBook(req, res);
});

router.post('/comment/:bookId', [authentication, authorization(librarian, regular)], (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input!', error });

  bookService.addComment(req, res);
});
router.post('/comment-reply/:bookId', [authentication, authorization(librarian, regular)], (req, res) => {
  const { error } = replyCommentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input!', error });

  bookService.replyComment(req, res);
});

router.put('/comment/:commentId', [authentication, authorization(librarian, regular)], (req, res) => {
  const { error } = commentSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid input!', error });

  bookService.editComment(req, res);
});

router.get('/comment/:bookId', [authentication, authorization(librarian, regular)], (req, res) => {
  bookService.findComments(req, res);
});

router.get('/genre', [authentication, authorization(librarian, regular)], (req, res) => {
  bookService.getGenre(req, res);
});

router.post('/genre', [authentication, authorization(librarian)], (req, res) => {
  if (!req.body.name) return res.status(400).json({ message: 'Missing genre name!' });
  bookService.addGenre(req, res);
});

router.delete('/genre/:name', [authentication, authorization(librarian)], (req, res) => {
  bookService.deleteGenre(req, res);
});

module.exports = router;
