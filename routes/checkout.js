const checkoutService = require('../service/checkout');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joi = require('joi');

const returnBookSchema = Joi.object({
    userId: Joi.string().required(),
    bookId: Joi.string().required()
});

router.post('/', [auth.authentication, auth.authorization2([auth.regular])], (req, res) => {
    if(!req.body.bookId) return res.status(400).send('Missing book id!');

    checkoutService.checkoutBook(req, res);
});

router.post('/return', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    const {error} = returnBookSchema.validate(req.body);
    if(error) return res.status(400).send(error);

    checkoutService.returnBook(req, res);
});

router.get('/', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).send('Page number of page size is not defined');
    checkoutService.findCheckouts(req, res);
});

module.exports = router;
