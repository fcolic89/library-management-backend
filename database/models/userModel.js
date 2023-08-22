const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    role: {type: String, enum: ['ADMIN', 'LIBRARIAN', 'REGULAR'], default: 'REGULAR'},
    canComment: {type: Boolean, default: true},
    takeBook: {type: Boolean, default: true}
}, { optimisticConcurrency: true });

const User = model('User', userSchema);
module.exports = User;
