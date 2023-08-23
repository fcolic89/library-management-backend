const User = require('../database/models/userModel');
const Checkout = require('../database/models/checkOutModel');
const Comment = require('../database/models/commentModel');
const dbConnection = require('../database/db');
const bcrypt = require('bcrypt');
const authService = require('./auth');

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
        res.json({message: "New user saved!"});
    }catch(err){
        res.status(500).json({message: 'Failed to save new user!Error: ' + err.message});
    }
}

async function deleteUser(req, res){
    const session = await dbConnection.startSession();
    try{
        const user = await User.findOne({ _id: req.params.id });
        if(!user) return res.status(400).json({message: 'Cannot delete user! User does not exist!.'});

        const checkouts = await Checkout.findOne({ userId: req.params.id, returned: false });
        if(checkouts && checkouts.length !== 0) return res.status(400).json({message: 'Cannot delete user! User still has unreturned books.'});

        session.startTransaction();

        const deleteUser = await User.deleteOne({ _id: req.params.id}, {session});
        if(!deleteUser) throw new Error(`Could not find user with id: ${req.params.id}`);

        const deleteCheckouts = await Checkout.deleteMany({ userId: req.params.id }, {session});
        if(!deleteCheckouts) throw new Error(`Could not find checkouts with user id: ${req.params.id}`);

        const comments = await Comment.find({ author: user.username });
        for(const c of comments){
            c.author = '[deleted]';
            await c.save({session});
        }

        await session.commitTransaction();
        res.json({message: 'User deleted!'});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'Error while trying to delete user: ' + err.message});
    }finally{
        session.endSession();
    }
}

async function updateUser(req, res){
    const session = await dbConnection.startSession();
    try{
        const user = await User.findOne({_id: req.user.id});
        let usernameChange = req.body.username !== user.username;
        let oldUsername = ''+user.username;

        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;
        user.email = req.body.email;
        user.username = req.body.username;
       
        if(req.body.email !== user.email){
            let tmpUser = await User.findOne({email: req.body.email});
            if(tmpUser && user._id !== tmpUser._id){
                return res.status(400).json({message: `User with email: ${req.body.email} already exists!`});
            }
        }

        session.startTransaction();
        
        if(usernameChange){
            const comments = await Comment.find({ author: oldUsername });
            for(const c of comments){
                c.author = user.username;
                await c.save({session});
            }
        }

        await user.save({session});
        await session.commitTransaction();

        let token = authService.generateToken(user._id, user.username, user.role, user.canComment, user.takeBook);
        res.json({'jwt': token});
    }catch(err){
        await session.abortTransaction();
        res.status(500).json({message: 'An error occurred while updating user information!'});
    }finally{
        session.endSession();
    }
}

async function findUserById(req, res){
    try{
        let user = await User.findOne({ _id: req.params.id});
        if(!user){
            res.status(404).json({message: `User with id: ${req.params.id} not found!`});
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
        res.status(500).json({message: `An error occurred while getting user with id: ${req.params.id}`})
    }
}

async function findUser(req, res){
    try{
        if(!req.query.role) req.query.role = ['ADMIN', 'LIBRARIAN', 'REGULAR'];
        else req.query.role = req.query.role.split(',');

        let limit = Number(req.query.size)+1;
        let skip = (Number(req.query.page)-1)*Number(req.query.size);

        let userList = await User.find({
            username: new RegExp(req.query.username, 'i'),
            email: new RegExp(req.query.email, 'i'),
            firstname: new RegExp(req.query.firstname, 'i'),
            lastname: new RegExp(req.query.lastname, 'i'),
            role: {$in: req.query.role} 
        })
            .limit(limit)
            .skip(skip)
            .sort({username: 1});

        let hasNext = false;
        if(userList.length === limit){
            hasNext = true;
            userList.splice(userList.length-1, 1);
        }

        let filteredList = [];
        userList.forEach(user => {
            let add = true;
            if(req.query.canComment !== undefined && user.canComment !== req.query.canComment) add = false;
            if(req.query.takeBook !== undefined && user.takeBook !== req.query.takeBook) add = false;

            if(add) filteredList.push(user);
        });

        res.send({
            hasNext: hasNext,
            users: filteredList
        });
    }catch(err){
        res.status(500).json({message: 'An error occurred while getting users! Error: ' + err});
    }
}

async function getUserInformation(req, res){
    try{
        let user = await User.findOne({ _id: req.user.id});
        if(!user){
            res.status(404).json({message: `User with id: ${req.user.id} not found!`});
        }else{
            res.send({
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email
            });
        }
    }catch(err){
        res.status(500).json({message: `An error occurred while getting user with id: ${req.user.id}`})
    }
}

async function changeCommentPriv(req ,res){
    try{
        const user = await User.findOne({_id: req.body.id});
        if(!user) return res.status(404).json({message: `User with id: ${req.body.id} does not exist!`});
        else if(user.role === 'ADMIN') return res.status(406).json({message: 'Cant change admin user privileges!'});

        user.canComment = !user.canComment;
        await user.save();
        res.json({message: 'Privilege changed!'});
    }catch(err){
        res.status(500).json({message: `An error occurred while changing user comment privileges: ${req.user.id}`})
    }
}

async function changeTakeBookPriv(req ,res){
    try{
        const user = await User.findOne({_id: req.body.id});
        if(!user) return res.status(404).json({message: `User with id: ${req.body.id} does not exist!`});
        else if(user.role !== 'REGULAR') return res.status(406).json({message: 'Cant change non-regular user privileges!'});

        user.takeBook = !user.takeBook;
        await user.save();
        res.json({message: 'Privilege changed!'});
    }catch(err){
        res.status(500).json({message: `An error occurred while changing user comment privileges: ${req.user.id}`})
    }
}

async function changePassword(req, res){
    try{
        const user = await User.findOne({ _id: req.user.id });
        if(!user) return res.status(404).json({message: 'User not found!'});

        let pass = await bcrypt.hash(req.body.password, 10);
        user.password = pass;

        await user.save();
        res.json({message: 'Password changed successfully'});
    }catch(err){
        res.status(500).json({message: 'An error occurred while changing password'});
    }
}

module.exports = {
    saveUser,
    deleteUser,
    updateUser,
    findUserById,
    getUserInformation,
    changePassword,
    findUser,
    changeCommentPriv,
    changeTakeBookPriv
}
