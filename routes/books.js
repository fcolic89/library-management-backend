const Joi = require('joi');
const express = require('express');
const router = express.Router();
const bookService = require('../service/book');
const auth = require('../middleware/auth');

const bookSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    author: Joi.string().required(),
    dateOfPublishing: Joi.string().required(),
    pageCount: Joi.number().required(),
    quantity: Joi.number().required(),
    genre: Joi.array().required(),
    imgUrl: Joi.string()
});

const updateSchema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    author: Joi.string().required(),
    dateOfPublishing: Joi.string().required(),
    pageCount: Joi.number().required(),
    quantity: Joi.number().required(),
    genre: Joi.array().required(),
    imgUrl: Joi.string()
});

router.post('/', [auth.authentication, auth.authorization2([auth.librarian])],(req, res) => {
    const result = bookSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    bookService.saveBook(req, res);
});

router.delete('/:id', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    bookService.deleteBook(req, res);
});

router.get('/:id', (req, res) => {
    bookService.findBookById(req, res);
});

router.post('/filter', (req, res) => {
    bookService.filterBooks(req, res);
});

router.put('/', [auth.authentication, auth.authorization2([auth.librarian])],(req, res) => {
    const result = updateSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    bookService.updateBook(req, res);
});

module.exports = router;
