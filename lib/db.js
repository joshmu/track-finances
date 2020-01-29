require('dotenv').config()
require('colors')

const { sleep } = require('./utils.js')
const mongoose = require('mongoose')
const Transaction = require(process.cwd() + 'models/transaction.js')

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

async function saveTransaction(transactionData, msg = false) {
  let options = { upsert: true, new: true, setDefaultsOnInsert: true }
  let document = { ...transactionData }
  if (transactionData.QUERY)
    document['$addToSet'] = { users: transactionData.QUERY.user } // if we have inital config then check/add user
  try {
    let transaction = await Transaction.findOneAndUpdate(
      { url: transactionData.url },
      document,
      options
    )
    let created =
      transaction.createdAt.getTime() === transaction.updatedAt.getTime()
    let notification = msg ? msg : created ? 'CREATE'.green : 'UPDATE'.blue
    console.log(`${notification}: ${transaction.url}`)
  } catch (e) {
    console.error('ERROR:'.red, e)
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
  saveTransaction
}
