const Joi = require('joi');
const express = require('express');
const router = express.Router();
const bookService = require('../service/book');
const auth = require('../middleware/auth');

const bookSchema = Joi.object({
    _id: Joi.string().allow(null, '').optional(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    author: Joi.string().required(),
    dateOfPublishing: Joi.string().required(),
    pageCount: Joi.number().required(),
    rating: Joi.number().allow(null, '').optional(),
    quantityMax: Joi.number().required(),
    quantityCurrent: Joi.number().allow(null, 0).optional(),
    genre: Joi.array().required(),
    imageUrl: Joi.string().allow(null, '').optional()
});

const updateSchema = Joi.object({
    _id: Joi.string().required(),
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3).required(),
    author: Joi.string().required(),
    dateOfPublishing: Joi.string().required(),
    pageCount: Joi.number().required(),
    quantityMax: Joi.number().required(),
    quantityCurrent: Joi.number().allow(null, 0).optional(),
    genre: Joi.array().required(),
    imageUrl: Joi.string().allow(null, '').optional(),
    rating: Joi.number().allow(null, '').optional()
});

const commentSchema = Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().allow('', null).optional(),
});

const replyCommentSchema = Joi.object({
    comment: Joi.string().required(),
    parentCommentId: Joi.string().required()
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

router.get('/find/:id', (req, res) => {
    bookService.findBookById(req, res);
});

router.get('/filter', (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).send('Page number of page size is not defined');
    bookService.filterBooks(req, res);
});

router.put('/', [auth.authentication, auth.authorization2([auth.librarian])],(req, res) => {
    const result = updateSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    bookService.updateBook(req, res);
});

router.post('/comment/:bookId', [auth.authentication, auth.authorization2([auth.librarian,auth.regular])], (req, res) => {
    const {error} = commentSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    bookService.addComment(req, res);
});
router.post('/comment-reply/:bookId', [auth.authentication, auth.authorization2([auth.librarian, auth.regular])], (req, res) => {
    const {error} = replyCommentSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    bookService.replyComment(req, res);
});

router.put('/comment/:commentId', [auth.authentication, auth.authorization2([auth.librarian, auth.regular])], (req, res) => {
    const {error} = commentSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    bookService.editComment(req, res);
});

router.get('/comment/:bookId', [auth.authentication, auth.authorization2([auth.librarian, auth.regular])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).send('Page number of page size is not defined');
    bookService.findComments(req, res);
});

router.get('/genre', [auth.authentication, auth.authorization2([auth.librarian, auth.regular])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    bookService.getGenre(req, res);
});

router.post('/genre', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.body.name) return res.status(400).json({message: 'Missing genre name!'});
    bookService.addGenre(req, res);
});

router.delete('/genre/:name', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    bookService.deleteGenre(req, res);
});

module.exports = router;
