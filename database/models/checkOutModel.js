const mongoose = require('mongoose');
const { Schema, model } = mongoose;


const checkOutSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, required: true},
    bookId: {type: Schema.Types.ObjectId, required: true},
    fine: {type: Number, default: 0},
    returned: {type: Date, default: null}
}, {timestamps: true});

const Checkout = model('Checkout', checkOutSchema);
module.exports = Checkout;
