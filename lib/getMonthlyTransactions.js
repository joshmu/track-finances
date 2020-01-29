let data = require(process.cwd() + '/output/results.json')
const fs = require('fs')
require('colors')
const clear = require('clear')
clear()
console.log('UBANK MONTHLY TRANSACTIONS 2 CSV'.bold.cyan)

// remove sweep transactions
data = data.filter(d => !d.desc.match(/sweep/gi))

// format values
data = data.map(d => {
  let result = d
  /*
  // already includes:
        date: '29/11/2019',
        desc: 'V0432 26/11 POCHANA PTY LTD          BOND Ref: 74940529331',
        amount: '-$15.60',
        bal: '$575.71CR'
    */
  result.unix = newDate(d.date).getTime()
  result.amount = Math.abs(+d.amount.replace('$', ''))
  result.bal = +d.bal.match(/(\d+\.\d+)/gi)
  return result
})

// range
const month = +process.argv[2] || 1
const startUnix = new Date(2020, month - 1, 1).getTime()
const endUnix = new Date(2020, month, 0).getTime()

data = data.filter(d => d.unix > startUnix && d.unix < endUnix)

// convert to csv
const fields = ['date', 'amount', 'desc']
// header
let csv = fields.join(',') + '\n'
// body
data.forEach(d => {
  csv += fields.map(f => d[f]).join(',') + '\n'
})
// output
fs.writeFile(process.cwd() + 'output/gsheet.csv', csv, err =>
  console.log('csv done')
)

// HELPERS

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
