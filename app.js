require('dotenv').config()
const scrapeUbank = require('./lib/scrape-ubank.js')
const { waitForDb, Transaction } = require('./lib/db.js')
;(async () => {
  await waitForDb()
  const ubankTransactions = await scrapeUbank()
})()
