require('dotenv').config()
require('colors')
const clear = require('clear')
const { scrapeUbank, formatUbank } = require('./lib/scrape-ubank.js')
const { waitForDb, saveTransactions } = require('./lib/db.js')
;(async () => {
  clear()
  console.log(`TRANSACTION TRACKING`.bgMagenta)
  await waitForDb()
  const ubankTransactions = await scrapeUbank()
  // const ubankTransactions = require('./output/results.json')
  const formattedUbankTransactions = formatUbank(ubankTransactions)
  // add to db
  await saveTransactions(formattedUbankTransactions)
  console.log(`${new Date()}`.dim)
  console.log('done.'.magenta)
  process.exit(0)
})()
