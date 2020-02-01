const { waitForDb, Transaction } = require('./db.js')
const { shortDateStr } = require('./utils.js')
require('colors')
const fs = require('fs')

;(async () => {
  // start
  const clear = require('clear')
  clear()
  console.log('UBANK MONTHLY TRANSACTIONS 2 CSV'.bold.cyan)
  await waitForDb()

  // data
  let data = await Transaction.find().sort([['date', -1]])
  console.log(`${data.length} transactions from DB`.cyan)

  // conversion
  data = getRange(data)
  console.log(`${data.length} transactions from RANGE`.green)
  const csv = convert2csv(data)
  console.log(csv)

  // save
  const filePath = process.cwd() + `/output/transactions-${shortDateStr()}.csv`
  console.log(filePath)
  console.log('saving...'.blue)
  fs.writeFileSync(filePath, csv)
  console.log('csv done'.green)

  console.log('done.'.yellow)
  process.exit(0)
  // END
})()

//////////////////////////////////////////////////
function getRange(data, range) {
  // current range is the month of jan
  const template = {
    start: {
      year: 2020,
      month: 1,
      day: 1
    },
    end: {
      year: 2020,
      month: 2,
      day: 0
    }
  }
  const config = { ...template, ...range }
  // range
  const startDate = new Date(
    config.start.year,
    config.start.month - 1, // months start from index 0
    config.start.day
  )
  const endDate = new Date(
    config.end.year,
    config.end.month - 1,
    config.end.day
  )
  data = data.filter(d => d.date > startDate && d.date < endDate)
  return data
}

function convert2csv(data, fieldsArr) {
  const csvData = data.map(d => {
    return {
      date: shortDateStr(d.date),
      amount: d.amount,
      desc: d.desc,
      unix: d.date.getTime()
    }
  })
  // convert to csv
  const fields = fieldsArr || ['date', 'amount', 'desc']
  // header
  let csv = fields.join(',') + '\n'
  // body
  csvData.forEach(d => {
    csv += fields.map(f => d[f]).join(',') + '\n'
  })
  return csv
}
