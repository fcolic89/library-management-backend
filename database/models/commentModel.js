const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const commentSchema = new Schema({
    username: {type: String, required: true},
    parentComment: {type: Schema.Types.ObjectId, ref: 'Comment', default: null},
    replies: {type: Boolean, default: false},
    comment: {type: String, required: true},
}, {timestamps: true});

const Comment = model('Comment', commentSchema);
module.exports = Comment;
