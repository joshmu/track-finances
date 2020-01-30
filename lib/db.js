require('dotenv').config()
require('colors')

const { sleep, shortAusDate } = require('./utils.js')
const mongoose = require('mongoose')
const Transaction = require(process.cwd() + '/models/transaction.js')

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () =>
  console.log(
    `connected to database: ${process.env.MONGODB_URI.split(/\//g).slice(-1)}`
      .magenta
  )
)

async function saveTransactions(ts) {
  // iterate over transactions saving each one to db
  return Promise.all(ts.map(t => saveNewTransaction(t)))
}

async function saveNewTransaction(t) {
  try {
    const foundDoc = await Transaction.findOne({ hashId: t.hashId })
    if (!foundDoc) {
      console.log(t)
      const doc = await new Transaction(t)
      await doc.save()
      console.log('SAVED:'.green, doc.hashId)
    }
  } catch (e) {
    console.error(e)
  }
}

async function waitForDb() {
  // wait for db...
  let dbWait = 0
  while (mongoose.connection.readyState !== 1 && dbWait < 15) {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    dbWait++
    await sleep(200, 'loading db')
  }
  if (dbWait >= 15) {
    console.error('ERROR DB: failing to conenct?')
  }
}

module.exports = {
  mongoose,
  db,
  Transaction,
  waitForDb,
  saveNewTransaction,
  saveTransactions
}
