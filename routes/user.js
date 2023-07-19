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
    id: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required()
});

router.post('/register', (req, res) => {
    const result = registerSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.post('/add', [auth.authentication, auth.authorization2(['ADMIN'])], (req, res) => {
    const result = registerSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.saveUser(req, res);
});

router.delete('/:id', [auth.authentication, auth.authorization2(['ADMIN'])], (req, res) => {
    userService.deleteUser(req, res);
});

router.put('/', [auth.authentication, auth.authorization2(['ADMIN', 'LIBRARIAN', 'REGULAR'])], (req, res) => {
    const result = updateSchema.validate(req.body);
    if(result.error){
        return res.status(400).send('Missing information!');
    }
    userService.updateUser(req, res);
});

router.post('/pwd-change', [auth.authentication, auth.authorization2(['ADMIN', 'LIBRARIAN', 'REGULAR'])], (req, res) => {
    userService.changePassword(req, res);
});

router.get('/profile', [auth.authentication, auth.authorization2(['ADMIN', 'LIBRARIAN', 'REGULAR'])], (req, res) => {
    userService.getUserInformation(req, res);
});

router.get('/test', [auth.authentication, auth.authorization2(['ADMIN','REGULAR'])],(req, res) => {
    res.send('Testing user route!');
});

module.exports = router;
