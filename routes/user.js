const Joi = require('joi');
const express = require('express');
const router = express.Router();
const userService = require('../service/user');
const auth = require('../middleware/auth');

const userSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
    email: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    role: Joi.string()
});

router.post('/register', (req, res) => {
    const result = userSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.save(req, res);
});

router.get('/test', [auth.authentication, auth.authorization(['ADMIN','REGULAR'])],(req, res) => {
    res.send('Testing user route!');
});

module.exports = router;
