const mongoose = require('mongoose')
const Schema = mongoose.Schema

// todo: need a variable to mark a winner

const transactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
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
