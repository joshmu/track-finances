require('dotenv').config()
require('colors')
const scrapeUbank = require('./lib/scrape-ubank.js')
const { newDate, stringHash } = require('./lib/utils.js')
const { waitForDb, saveTransactions } = require('./lib/db.js')
;(async () => {
  await waitForDb()
  // const ubankTransactions = await scrapeUbank()
  const ubankTransactions = require('./output/results.json')
  console.log(ubankTransactions.slice(-10))
  // parse
  const formattedUbankTransactions = formatUbank(ubankTransactions)
  console.log(formattedUbankTransactions.slice(-10))
  // add to db
  await saveTransactions(formattedUbankTransactions)
  console.log('done'.yellow)
  process.exit(0)
})()

// schema appropriate data plus hash id
function formatUbank(ts) {
  return ts
    .filter(t => !t.desc.match(/sweep/gi)) // remove sweep (top up) transactions
    .map(t => {
      /*
        date: '29/11/2019',
        desc: 'V0432 26/11 POCHANA PTY LTD          BOND Ref: 74940529331',
        amount: '-$15.60',
        bal: '$575.71CR'
    */
      return {
        date: newDate(t.date),
        bank: 'ubank',
        desc: t.desc,
        amount: +t.amount.replace('$', '')
      }
    })
    .map(t => {
      return { hashId: stringHash(t.date + t.desc), ...t }
    })
}
