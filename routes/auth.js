const express = require('express');

const router = express.Router();
const authService = require('../service/auth');
const { loginSchema } = require('./joi');
const error = require('../middleware/errorHandling/errorConstants');
const { catchAsyncError } = require('../middleware/errorHandling/functionErrorHandler');

router.post('/login', (req, res, next) => {
  const { error: validationError } = loginSchema.validate(req.body);
  if (validationError) {
    throw new Error(error.BAD_REQUEST);
  }
  next();
}, catchAsyncError(authService.login));

module.exports = router;
