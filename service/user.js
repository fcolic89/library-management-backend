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
            isDeleted: false
        });
        if(req.body.role && req.body.role !== 'REGULAR'){
            user.role = req.body.role;
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
        const deleted = await User.deleteOne({ _id: req.params.id});
        if(deleted) res.send('User deleted!');
        else throw new Error(`Could not find user with id: ${req.params.id}`);
    }catch(err){
        res.status(404).send('Error while trying to delete user: ' + err.message);
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

async function findUser(req, res){
    try{
        if(!req.body.roles) req.body.roles = ['ADMIN', 'LIBRARIAN', 'REGULAR'];

        let userList = await User.find({
            username: new RegExp(req.body.username, 'i'),
            email: new RegExp(req.body.email, 'i'),
            firstname: new RegExp(req.body.firstname, 'i'),
            lastname: new RegExp(req.body.lastname, 'i'),
            role: {$in: req.body.roles} 
        });

        let filteredList = [];
        userList.forEach(user => {
            let add = true;
            if(req.body.isDeleted !== undefined && user.isDeleted !== req.body.isDeleted) add = false;
            if(req.body.canComment !== undefined && user.canComment !== req.body.canComment) add = false;
            if(req.body.takeBook !== undefined && user.takeBook !== req.body.takeBook) add = false;

            if(add) filteredList.push(user);
        })

        res.send(filteredList);
    }catch(err){
        res.status(500).send('An error occurred while getting users! Error: ' + err);
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
    changePassword,
    findUser
}
