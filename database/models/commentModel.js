const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const commentSchema = new Schema({
    bookId: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    author: {type: String, required: true},
    parentCommentId: {type: Schema.Types.ObjectId, ref: 'Comment', default: null},
    rating: {type: Number, default: 0},
    replies: {type: Boolean, default: false},
    edited: {type: Boolean, deafult: false},
    comment: {type: String},
}, {timestamps: true});

const Comment = model('Comment', commentSchema);
module.exports = Comment;
