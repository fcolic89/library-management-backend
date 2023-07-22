const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const bookSchema = new Schema({
    title: {type: String, required: true},
    author: {type: String, required: true},
    dateOfPublishing: {type: Date, required: true},
    rating: {type: Number, default: 0},
    pageCount: {type: Number, required: true},
    quantityMax: {type: Number, required: true},
    quantityCurrent: {type: Number, required: true},
    imageUrl: {type: String},
    description: {type: String, required: true},
    genre: [{type: String, enum: ['Fiction', 'Historical Fiction', 'Romance', 'Adult', 'Classics', 'Historical', 'Comedy']}]
});

const Book = model('Book', bookSchema);
module.exports = Book;
