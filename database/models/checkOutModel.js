const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const checkOutSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    fine: {type: Number, default: 0},
    returned: {type: Date, default: null}
}, {timestamps: true});

const Checkout = model('Checkout', checkOutSchema);
module.exports = Checkout;
