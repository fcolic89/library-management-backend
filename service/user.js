const User = require('../database/models/userModel');
const Checkout = require('../database/models/checkOutModel');
const Comment = require('../database/models/commentModel');
const dbConnection = require('../database/db');
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
    const session = await dbConnection.startSession();
    try{
        const user = await User.findOne({ _id: req.params.id });
        if(!user) return res.status(400).send('Cannot delete user! User does not exist!.');

        const checkouts = await Checkout.findOne({ userId: req.params.id, returned: null });
        if(checkouts && checkouts.length !== 0) return res.status(400).send('Cannot delete user! User still has unreturned books.');

        session.startTransaction();

        const deleteUser = await User.deleteOne({ _id: req.params.id}, {session});
        if(!deleteUser) throw new Error(`Could not find user with id: ${req.params.id}`);

        const deleteCheckouts = await Checkout.deleteMany({ userId: req.params.id }, {session});
        if(!deleteCheckouts) throw new Error(`Could not find checkouts with user id: ${req.params.id}`);

        const comments = Comment.find({ username: user.username });
        comments.forEach(c => async function(){
            c.author = '[deleted]';
            await c.save({session});
        });

        await session.commitTransaction();
        res.send('User deleted!');
    }catch(err){
        await session.abortTransaction();
        res.status(500).send('Error while trying to delete user: ' + err.message);
    }finally{
        session.endSession();
    }
}

async function updateUser(req, res){
    const session = await dbConnection.startSession();
    try{
        const user = await User.findOne({_id: req.user.id});
        var usernameChange = req.body.username !== user.username;

        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.username = req.body.username;
        
        if(req.body.email !== user.email){
            let tmpUser = await User.findOne({email: req.body.email});
            if(tmpUser && user._id !== tmpUser._id){
                return res.status(400).send(`User with email: ${req.body.email} already exists!`);
            }
        }

        if(usernameChange){
            tmpUser = await User.findOne({username: req.body.username});
            if(tmpUser && user._id !== tmpUser._id){
                return res.status(400).send(`User with username: ${req.body.username} already exists!`);
            }
            session.startTransaction();

            const comments = await Comment.find({ author: user.username });
            comments.forEach(c => async function(){
                c.author = req.body.username;
                await c.save({session});
            })
        }

        await user.save({session});
        if(usernameChange) await session.commitTransaction();

        res.send({
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email
        })
    }catch(err){
        if(usernameChange) await session.abortTransaction();
        res.status(500).send('An error occurred while updating user information!');
    }finally{
        session.endSession();
    }
}

async function findUserById(req, res){
    try{
        let user = await User.findOne({ _id: req.params.id});
        if(!user){
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
        if(!req.query.role) req.query.role = ['ADMIN', 'LIBRARIAN', 'REGULAR'];

        let userList = await User.find({
            username: new RegExp(req.query.username, 'i'),
            email: new RegExp(req.query.email, 'i'),
            firstname: new RegExp(req.query.firstname, 'i'),
            lastname: new RegExp(req.query.lastname, 'i'),
            role: {$in: req.query.role} 
        })
            .limit(req.query.size)
            .skip((req.query.page-1)*req.query.size)
            .sort({username: 1});

        let filteredList = [];
        userList.forEach(user => {
            let add = true;
            if(req.query.canComment !== undefined && user.canComment !== req.query.canComment) add = false;
            if(req.query.takeBook !== undefined && user.takeBook !== req.query.takeBook) add = false;

            if(add) filteredList.push(user);
        });

        res.send(filteredList);
    }catch(err){
        res.status(500).send('An error occurred while getting users! Error: ' + err);
    }
}

async function getUserInformation(req, res){
    try{
        let user = await User.findOne({ _id: req.user.id});
        if(!user){
            res.status(404).send(`User with id: ${req.user.id} not found!`);
        }else{
            res.send({
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
        if(!user) return res.status(404).send('User not found!');

        let pass = await bcrypt.hash(req.body.password, 10);
        user.password = pass;

        await user.save();
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
