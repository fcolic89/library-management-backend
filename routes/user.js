const Joi = require('joi');
const express = require('express');
const router = express.Router();
const userService = require('../service/user');
const auth = require('../middleware/auth');

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
    let auth = req.header('Authorization');
    if(auth) return res.status(401).send('Access denied. User is already logged in!');

    let token = auth.split(" ")[1];
    if(token) return res.status(401).send('Access denied. User is already logged in!');

    const result = registerSchema.validate(req.body);
    if(result.error || req.body.role !== auth.regular){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.post('/add', [auth.authentication, auth.authorization2([auth.admin])], (req, res) => {
    const result = registerSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.delete('/:id', [auth.authentication, auth.authorization2([auth.admin])], (req, res) => {
    userService.deleteUser(req, res);
});

router.put('/', [auth.authentication, auth.authorization2([auth.admin, auth.librarian, auth.regular])], (req, res) => {
    const result = updateSchema.validate(req.body);
    if(result.error){
        return res.status(400).json({message: 'Missing information!'});
    }
    userService.updateUser(req, res);
});

router.get('/find', [auth.authentication, auth.authorization2([auth.admin])], (req, res) => {
    if(!req.query.size || !req.query.page) return res.status(400).json({message: 'Page number of page size is not defined'});
    userService.findUser(req, res);
});

router.put('/pwd-change', [auth.authentication, auth.authorization2([auth.admin, auth.librarian, auth.regular])], (req, res) => {
    if(!req.body.password) return res.status(400).json({message: 'Missing password!'});
    userService.changePassword(req, res);
});

router.get('/profile', [auth.authentication, auth.authorization2([auth.admin, auth.librarian, auth.regular])], (req, res) => {
    userService.getUserInformation(req, res);
});

router.put('/priv/comment', [auth.authentication, auth.authorization2([auth.admin])], (req, res) =>{
    const { error } = changePrivSchema.validate(req.body);
    if(error) return res.status(400).json({message: error});

    userService.changeCommentPriv(req, res);
});

router.put('/priv/book', [auth.authentication, auth.authorization2([auth.admin])], (req, res) =>{
    const { error } = changePrivSchema.validate(req.body);
    if(error) return res.status(400).json({message: error});

    userService.changeTakeBookPriv(req, res);
});

module.exports = router;
