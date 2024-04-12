const Joi = require('joi').extend(require('@joi/date'));
const { userRoles } = require('../database/models');

const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
  email: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  role: Joi.string().optional().valid(userRoles.admin, userRoles.librarian, userRoles.regular),
});

const updateUserSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required(),
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
});

const changePrivSchema = Joi.object({
  id: Joi.string().required(),
});

const bookSchema = Joi.object({
  _id: Joi.string().allow(null, '').optional(),
  title: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
  author: Joi.string().required(),
  dateOfPublishing: Joi.date().format('YYYY-MM-DD').required(),
  pageCount: Joi.number().positive().required(),
  rating: Joi.number().allow(null, '').optional(),
  quantityMax: Joi.number().positive().allow(0).required(),
  quantityCurrent: Joi.number().positive().allow(null, 0).optional(),
  genre: Joi.array().required(),
  imageUrl: Joi.string().allow(null, '').optional(),
});

const updateBookSchema = Joi.object({
  _id: Joi.string().required(),
  title: Joi.string().min(3).required(),
  description: Joi.string().min(3).required(),
  author: Joi.string().required(),
  dateOfPublishing: Joi.date().format('YYYY-MM-DD').required(),
  pageCount: Joi.number().positive().required(),
  quantityMax: Joi.number().positive().allow(0).required(),
  quantityCurrent: Joi.number().positive().allow(null, 0).optional(),
  genre: Joi.array().required(),
  imageUrl: Joi.string().allow(null, '').optional(),
  rating: Joi.number().allow(null, '').optional(),
});

const commentSchema = Joi.object({
  rating: Joi.number().required(),
  comment: Joi.string().allow('', null).optional(),
});

const returnBookSchema = Joi.object({
  userId: Joi.string().required(),
  bookId: Joi.string().required(),
});
const checkoutBookSchema = Joi.object({
  checkoutId: Joi.string().allow(null).optional(),
  userId: Joi.string().required(),
  bookId: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(3).required(),
  password: Joi.string().min(3).required(),
});

module.exports = {
  registerSchema,
  updateUserSchema,
  changePrivSchema,
  bookSchema,
  updateBookSchema,
  commentSchema,
  returnBookSchema,
  checkoutBookSchema,
  loginSchema,
};
