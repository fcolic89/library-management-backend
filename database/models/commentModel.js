const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const commentSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 },
  edited: { type: Boolean, deafult: false },
  comment: { type: String },
}, { timestamps: true, optimisticConcurrency: true });

const Comment = model('Comment', commentSchema);
module.exports = Comment;
