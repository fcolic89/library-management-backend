const express = require('express');

const router = express.Router();
const userService = require('../service/user');
const { regular, librarian, admin } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const { registerSchema, updateUserSchema, changePrivSchema } = require('./joi');

router.post('/register', (req, res) => {
  const result = registerSchema.validate(req.body);
  if (result.error || req.body.role !== regular) {
    return res.status(400).send(result.error);
  }
  userService.saveUser(req, res);
});

router.post('/add', [authentication, authorization(admin)], (req, res) => {
  const result = registerSchema.validate(req.body);
  if (result.error) {
    return res.status(400).send(result.error);
  }
  userService.saveUser(req, res);
});

router.delete('/:id', [authentication, authorization(admin)], (req, res) => {
  userService.deleteUser(req, res);
});

router.put('/', [authentication, authorization(admin, librarian, regular)], (req, res) => {
  const result = updateUserSchema.validate(req.body);
  if (result.error) {
    return res.status(400).json({ message: 'Missing information!' });
  }
  userService.updateUser(req, res);
});

router.get('/find', [authentication, authorization(admin)], (req, res) => {
  userService.findUser(req, res);
});

router.get('/findRegular', [authentication, authorization(librarian)], (req, res) => {
  req.query.role = 'REGULAR,';
  userService.findUser(req, res);
});

router.put('/pwd-change', [authentication, authorization(admin, librarian, regular)], (req, res) => {
  if (!req.body.password) return res.status(400).json({ message: 'Missing password!' });
  userService.changePassword(req, res);
});

router.get('/profile', [authentication, authorization(admin, librarian, regular)], (req, res) => {
  userService.getUserInformation(req, res);
});

router.put('/priv/comment', [authentication, authorization(admin)], (req, res) => {
  const { error } = changePrivSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid information!', error });

  userService.changeCommentPriv(req, res);
});

router.put('/priv/book', [authentication, authorization(admin)], (req, res) => {
  const { error } = changePrivSchema.validate(req.body);
  if (error) return res.status(400).json({ message: 'Invalid information!', error });

  userService.changeTakeBookPriv(req, res);
});

module.exports = router;
