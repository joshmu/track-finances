let data = require('./results.json')
require('colors')
const asciichart = require('asciichart')
const clear = require('clear')
clear()
console.log('STATS FOR UBANK TRANSACTIONS'.bold.cyan)

// remove sweep transactions
data = data.filter(d => !d.desc.match(/sweep/gi))

// format values
data = data.map(d => {
  let result = d
  /*
        date: '29/11/2019',
        desc: 'V0432 26/11 POCHANA PTY LTD          BOND Ref: 74940529331',
        amount: '-$15.60',
        bal: '$575.71CR'
    */
  result.unix = newDate(d.date).getTime()
  result.amount = +d.amount.replace('$', '')
  result.bal = +d.bal.match(/(\d+\.\d+)/gi)
  return result
})

// create an array with each entry as a day
const firstUnix = data[data.length - 1].unix
const lastUnix = data[0].unix
const daysDuration = Math.ceil((lastUnix - firstUnix) / 1000 / 60 / 60 / 24)

// initialize
let daysArr = new Array(daysDuration).fill({}).map((day, i) => {
  day = {}
  day.unix = firstUnix + i * 24 * 60 * 60 * 1000
  day.date = shortAusDate(day.unix)
  day.transactions = data.filter(dataDay => day.date === dataDay.date)
  // console.log({ date: day.date, transactions: day.transactions })
  // add a total
  day.total = day.transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  )
  return day
})
// console.log(daysArr)

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
console.log(weekly)

// weekly in to daily for longer graph
let mod = weekly
  .map(w => {
    return new Array(7).fill(Math.abs(w / 7))
  })
  .flat(1)

console.log(`${daysDuration} days of data...`.cyan)
console.log(`${weekly.length} weeks.`.cyan)
console.log(asciichart.plot(mod, { height: 30 }))

function newDate(date) {
  const [d, m, y] = date.split(/\//g)
  return new Date(+y, +m - 1, +d + 1)
}

function shortAusDate(unix) {
  const date = new Date(unix)
  const month = date.getMonth() + 1
  return `${date.getDate()}/${
    month < 10 ? '0' + month : month
  }/${date.getFullYear()}`
}
