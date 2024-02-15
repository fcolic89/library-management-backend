const Joi = require('joi');
const express = require('express');
const router = express.Router();
const userService = require('../service/user');
const { regular, librarian, admin } = require('../database/models').userRoles;
const { authentication, authorization } = require('../middleware/auth');

const registerSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
    email: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    role: Joi.string()
});

const updateSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required()
});

const changePrivSchema = Joi.object({
    id: Joi.string().required()
});

router.post('/register', (req, res) => {
    const result = registerSchema.validate(req.body);
    if(result.error || req.body.role !== userRoles.regular){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.post('/add', [authentication, authorization(admin)], (req, res) => {
    const result = registerSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.delete('/:id', [authentication, authorization(admin)], (req, res) => {
    userService.deleteUser(req, res);
});

router.put('/', [authentication, authorization(admin, librarian, regular)], (req, res) => {
    const result = updateSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({message: 'Missing information!'});
    }
    userService.updateUser(req, res);
});

router.get('/find', [authentication, authorization(admin)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    userService.findUser(req, res);
});

router.get('/findRegular', [authentication, authorization(librarian)], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    req.query.role = 'REGULAR,';
    userService.findUser(req, res);
});

router.put('/pwd-change', [authentication, authorization(admin, librarian, regular)], (req, res) => {
    if(!req.body.password) return res.status(400).json({message: 'Missing password!'});
    userService.changePassword(req, res);
});

router.get('/profile', [authentication, authorization(admin, librarian, regular)], (req, res) => {
    userService.getUserInformation(req, res);
});

router.put('/priv/comment', [authentication, authorization(admin)], (req, res) =>{
    const { error } = changePrivSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    userService.changeCommentPriv(req, res);
});

router.put('/priv/book', [authentication, authorization(admin)], (req, res) =>{
    const { error } = changePrivSchema.validate(req.body);
    if(error) return res.status(400).json({message: 'Invalid information!', error: error});

    userService.changeTakeBookPriv(req, res);
});

module.exports = router;
