let data = require('./results.json')
require('colors')

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
  result.unix = new Date(d.date).getTime()
  result.amount = +d.amount.replace('$', '')
  result.bal = +d.bal.match(/(\d+\.\d+)/gi)
  return result
})

// batch by days (object)
let o = data.reduce((acc, c) => {
  acc[c.date] ? acc[c.date].push(c) : (acc[c.date] = [c])
  return acc
}, {})
console.log(o)

// spent each day (converted to array)
o = Object.keys(o).map(d => {
  return {
    date: d,
    spent: o[d].reduce((acc, c) => acc + c.amount, 0)
  }
})
// console.log(o)

let unix = new Date(o[o.length - 1].date).getTime()
let today = new Date().getTime()
let totalDays = Math.round((today - unix) / 1000 / 60 / 60 / 24)

// other costs
let rent_w = 120 // lancefield
let joint_w = 25
let phone_w = 10
let travel_w = 40
let bills_w = 25

let total = Math.abs(Math.round(o.reduce((acc, c) => acc + c.spent, 0)))
let avgDaily = Math.abs(Math.round(total / totalDays))
let avgWeekly = Math.abs(
  avgDaily * 7 + rent_w + joint_w + phone_w + travel_w + bills_w
)

console.log('\n\n')
console.log(`${totalDays} days...`.green)
console.log(
  `Total spend since ${o[o.length - 1].date}: $${total.toFixed(2)}`.cyan
)
console.log(`Average purchases per day: $${avgDaily}`.cyan)
console.log(`Average spend per week: $${Math.round(avgDaily * 7)}`.cyan)
console.log(`Average spend per month: $${avgDaily * 7 * 4}`.cyan)
console.log('')
console.log(`Average life cost per day: $${Math.round(avgWeekly / 7)}`.yellow)
console.log(`Average life cost per week: $${avgWeekly}`.yellow)
console.log(`Average life cost per month: $${avgWeekly * 4}`.yellow)
console.log('\n\n')

// average spend that week ** incorrect only based on 7 entries rather than date specific
/*
let weekly = []
for (let i = 0; i < o.length; i+=7) {
    let avg = +(o.slice(i, i+7).reduce((acc, c) => acc + c.spent, 0) / 7).toFixed(2)

    weekly.push(avg)
}

console.log(weekly)
*/
