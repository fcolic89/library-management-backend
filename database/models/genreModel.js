const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const genreSchema = new Schema({
    name: {type: String, unique: true, required: true}
});

const Genre = model('Genre', genreSchema);
module.exports = Genre;
