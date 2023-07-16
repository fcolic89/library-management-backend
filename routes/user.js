const Joi = require('joi');
const express = require('express');
const router = express.Router();
const userService = require('../service/user');

const userSchema = Joi.object({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
    email: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    isAdmin: Joi.boolean()
});

router.post('/', (req, res) => {
    const result = userSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    userService.save(req, res);
});

router.get('/test', (req, res) => {
    res.send('Testing user route!');
});

module.exports = router;
