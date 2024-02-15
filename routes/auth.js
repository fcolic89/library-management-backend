const express = require('express');
const router = express.Router();
const authService = require('../service/auth')
const { loginSchema } = require('./joi');

router.post('/login', (req, res) => {
    const result = loginSchema.validate(req.body);
    if(result.error){
        return res.status(400).send(result.error);
    }
    //check for user and return jwt
    authService.login(req, res);
});

module.exports = router;
