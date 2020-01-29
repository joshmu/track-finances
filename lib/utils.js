const sleep = async t => new Promise(resolve => setTimeout(resolve, t))
const stringHash = require('string-hash')

function newDate(date) {
  const [d, m, y] = date.split(/\//g)
  return new Date(+y, +m - 1, +d + 1)
}

function shortAusDate(unixOrDateStr) {
  const date = new Date(unixOrDateStr)
  const month = date.getMonth() + 1
  return `${date.getDate()}/${
    month < 10 ? '0' + month : month
  }/${date.getFullYear()}`
}

module.exports = { sleep, newDate, shortAusDate, stringHash }
