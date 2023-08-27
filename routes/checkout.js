const checkoutService = require('../service/checkout');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joi = require('joi');

const returnBookSchema = Joi.object({
    userId: Joi.string().required(),
    bookId: Joi.string().required()
});
const checkoutBookSchema = Joi.object({
    checkoutId: Joi.string().allow(null).optional(),
    userId: Joi.string().required(),
    bookId: Joi.string().required(),
    reserved: Joi.bool().allow(null).optional()
});

router.post('/', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    const {error} = checkoutBookSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    checkoutService.checkoutBook(req, res);
});
router.post('/reserve', [auth.authentication, auth.authorization2([auth.regular])], (req, res) => {
    if(!req.body.bookId) return res.status(400).json({message: 'Missing book id!'});

    checkoutService.reserveBook(req, res);
});

router.put('/return', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    const {error} = returnBookSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    checkoutService.returnBook(req, res);
});

router.get('/', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.findCheckouts(req, res);
});

router.get('/fines', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.agregateFines(req, res);
});

router.get('/user/:username', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.userCheckouts(req, res);
});

router.get('/book/:bookId', [auth.authentication, auth.authorization2([auth.librarian])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.bookCheckouts(req, res);
});

router.get('/self', [auth.authentication, auth.authorization2([auth.regular])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.myCheckouts(req, res);
});

module.exports = router;
