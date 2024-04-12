const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const bookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  dateOfPublishing: { type: Date, required: true },
  pageCount: { type: Number, required: true },
  quantityMax: { type: Number, required: true },
  quantityCurrent: {
    type: Number,
    required: true,
    validate: {
      validator(v) {
        return v >= 0;
      },
    },
  },
  imageUrl: { type: String },
  description: { type: String, required: true },
  genre: [{ type: String }],
}, { optimisticConcurrency: true });

const Book = model('Book', bookSchema);
module.exports = Book;
