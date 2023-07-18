const User = require('../database/models/userModel');
const bcrypt = require('bcrypt');

async function save(req, res) {
    try{
        let enpass = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: enpass,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            isAdmin: req.body.isAdmin || false,
            isDeleted: false
        });
        await user.save();
        res.send("New user saved!");
    }catch(err){
        res.status(500).send('Failed to save new user!Error: ' + err.message);
    }
}

module.exports = {
    save
}
