const checkoutService = require('../service/checkout');
const express = require('express');
const router = express.Router();
const { regular, librarian } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');
const { checkoutBookSchema, returnBookSchema } = require('./joi');

router.post('/', [authentication, authorization(librarian)], (req, res) => {
    const {error} = checkoutBookSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    checkoutService.checkoutBook(req, res);
});
router.post('/reserve', [authentication, authorization(regular)], (req, res) => {
    if(!req.body.bookId) return res.status(400).json({message: 'Missing book id!'});

    checkoutService.reserveBook(req, res);
});

router.put('/return', [authentication, authorization(librarian)], (req, res) => {
    const {error} = returnBookSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    checkoutService.returnBook(req, res);
});

router.get('/', [authentication, authorization(librarian)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.findCheckouts(req, res);
});

router.get('/fines', [authentication, authorization(librarian)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.agregateFines(req, res);
});

router.get('/user/:username', [authentication, authorization(librarian)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.userCheckouts(req, res);
});

router.get('/book/:bookId', [authentication, authorization(librarian)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.bookCheckouts(req, res);
});

router.get('/self', [authentication, authorization(regular)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    checkoutService.myCheckouts(req, res);
});

module.exports = router;
