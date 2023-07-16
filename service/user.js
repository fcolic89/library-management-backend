const User = require('../database/models/userModel');

async function save(req, res) {
    try{
        const user = new User({
            username: req.body.username,
            password: req.body.password,
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
