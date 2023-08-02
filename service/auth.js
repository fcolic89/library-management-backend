const User = require('../database/models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

async function login(req, res){
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password!');
    let match = await bcrypt.compare(req.body.password, user.password);

    if(!match) return res.status(400).send('Invalid email or password!');
    
    let token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role
        }, privateKey);
    res.json({'jwt': token});
}

module.exports = login;

