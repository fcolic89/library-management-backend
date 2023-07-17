const Joi = require('joi');
const express = require('express');
const router = express.Router();
const authService = require('../service/auth')


const loginSchema = Joi.object({
    email: Joi.string().min(3).required(),
    password: Joi.string().min(3).required(),
});

router.post('/login', (req, res) => {
    const result = loginSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    //check for user and return jwt
    authService(req, res);
});

module.exports = router;
