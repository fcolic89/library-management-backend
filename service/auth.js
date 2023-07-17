const User = require('../database/models/userModel');
const jwt = require('jsonwebtoken');

const privateKey = process.env.PRIVATE_KEY || 'supersecretandsuperprivatekey';

async function login(req, res){
    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password!');

    if(user.password !== req.body.password || user.isDeleted === true) return res.status(400).send('Invalid email or password!');

    res.send(
        jwt.sign({
            _id: user.id,
            username: user.username,
            role: user.role
        }, privateKey));
}

module.exports = login;

