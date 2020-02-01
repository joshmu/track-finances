const { waitForDb, Transaction } = require('./db.js')
const { shortAusDate, shortDateStr } = require('./utils.js')
require('colors')
const asciichart = require('asciichart')
const clear = require('clear')

;(async () => {
  // start
  clear()
  console.log('STATS FOR UBANK TRANSACTIONS'.bold.cyan)
  await waitForDb()

  // data
  let data = await Transaction.find().sort([['date', -1]])
  console.log(
    `${shortDateStr(data[data.length - 1].date)} - ${shortDateStr(
      data[0].date
    )}`.blue
  )
  console.log(`${data.length} transactions from DB`.blue)

  // create an array with each entry as a day
  const first = data[data.length - 1].date
  const last = data[0].date
  const daysDuration = Math.ceil((last - first) / 1000 / 60 / 60 / 24)

  // initialize
  let daysArr = new Array(daysDuration).fill({}).map((day, i) => {
    day = {}
    day.unix = first.getTime() + i * 24 * 60 * 60 * 1000
    day.date = shortDateStr(new Date(day.unix))
    day.transactions = data.filter(
      dataDay => day.unix === dataDay.date.getTime()
    )
    // console.log({ date: day.date, transactions: day.transactions })
    // add a total
    day.total = day.transactions.reduce(
      (total, transaction) => total + transaction.amount,
      0
    )
    return day
  })

  // weekly avg
  let weekly = []
  let weekTotal = 0
  daysArr.forEach((day, i) => {
    weekTotal += day.total
    if ((i + 1) % 7 === 0) {
      weekly.push(weekTotal)
      weekTotal = 0
    }
  })

  /*
// weekly in to daily for longer graph
let mod = weekly
  .map(w => {
    return new Array(7).fill(Math.abs(w / 7))
  })
  .flat(1)
  */

  // 7 day moving avg
  const rangeDays = 30
  const ma = daysArr.slice(rangeDays).map((day, i) => {
    const idx = i + rangeDays
    let rangeTotal = 0
    for (let y = idx - rangeDays; y <= idx; y++) {
      // console.log({ y, idx })
      // console.log('daysArr[y]', daysArr[y])
      rangeTotal += daysArr[y].total
    }
    // console.log(day)
    return Math.abs(+(rangeTotal / rangeDays).toFixed(2))
  })
  // console.log('ma', ma.slice(-10))

  console.log(`${daysDuration} days of data...`.cyan)
  console.log(`${weekly.length} weeks.`.cyan)
  console.log(`${rangeDays} day moving average:`.yellow)
  console.log('')
  console.log(asciichart.plot(ma, { height: 30 }))
  console.log('')
  process.exit(0)
})()
