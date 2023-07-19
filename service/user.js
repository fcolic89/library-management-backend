const User = require('../database/models/userModel');
const bcrypt = require('bcrypt');

async function saveUser(req, res) {
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
        if(req.role && req.role !== 'REGULAR'){
            user.canComment = false;
            user.takeBook = false;
        }
        await user.save();
        res.send("New user saved!");
    }catch(err){
        res.status(500).send('Failed to save new user!Error: ' + err.message);
    }
}

async function deleteUser(req, res){
    try{
        const user = await User.findOne({ _id: req.params.id});
        user.isDeleted = true;
        user.save();
        res.send('User deleted!');
    }catch(err){
        res.status(404).send('Could not find user with id: ' + req.params.id);
    }
}

async function updateUser(req, res){
    try{
        const user = await User.findOne({_id: req.body.id});
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.username = req.body.username;
        
        if((await User.findOne({email: req.body.email}))){
            return res.status(400).send(`User with email: ${req.body.email} already exists!`);
        }
        if((await User.findOne({username: req.body.username}))){
            return res.status(400).send(`User with username: ${req.body.username} already exists!`);
        }
        user.save();
        res.send({
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email
        })
    }catch(err){
        res.status(500).send('An error occurred while updating user information!');
    }
}

async function findUserById(req, res){
    try{
        let user = await User.findOne({ _id: req.params.id});
        if(!user || user.isDeleted === true){
            res.status(404).send(`User with id: ${req.params.id} not found!`);
        }else{
            res.send({
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email
            });
        }

    }catch(err){
        res.status(500).send(`An error occurred while getting user with id: ${req.params.id}`)
    }
}

async function getUserInformation(req, res){
    try{
        let user = await User.findOne({ _id: req.user.id});
        if(!user || user.isDeleted === true){
            res.status(404).send(`User with id: ${req.user.id} not found!`);
        }else{
            res.send({
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email
            });
        }

    }catch(err){
        res.status(500).send(`An error occurred while getting user with id: ${req.user.id}`)
    }
}

async function changePassword(req, res){
    try{
        const user = await User.findOne({ _id: req.user.id });
        if(!user || user.isDeleted) return res.status(404).send('User not found!');
        let pass = await bcrypt.hash(req.body.password, 10);
        user.password = pass;
        user.save();
        res.send('Password changed successfully');
    }catch(err){
        res.status(500).send('An error occurred while changing password');
    }
}

module.exports = {
    saveUser,
    deleteUser,
    updateUser,
    findUserById,
    getUserInformation,
    changePassword
}
