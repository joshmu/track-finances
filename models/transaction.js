const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema(
  {
    hashId: { type: Number, required: true, unique: true },
    bank: String,
    date: Date,
    desc: String,
    amount: Number,
    ignore: { type: Boolean, default: false },
    notes: String
  },
  { timestamps: true }
)

module.exports = mongoose.model('Transaction', transactionSchema)
