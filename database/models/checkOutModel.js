const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const checkoutStatus = {
  pending: 'PENDING',
  checkedout: 'CHECKEDOUT',
  returned: 'RETURNED'
}


const checkOutSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
    fine: {type: Number, default: 0},
    status: {type: String, enum: checkoutStatus.values, default: checkoutStatus.pending},
}, { timestamps: true, optimisticConcurrency: true});

const Checkout = model('Checkout', checkOutSchema);
module.exports = {
  Checkout,
  checkoutStatus
};
