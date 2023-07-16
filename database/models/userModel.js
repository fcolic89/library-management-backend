const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    isAdmin: Boolean,
    isDeleted: {type: Boolean, required: true}
});

const User = model('User', userSchema);
module.exports = User;
