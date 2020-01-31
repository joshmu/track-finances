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

function timezoneString(date, timezone) {
  timezone = timezone || 'Australia/Brisbane'
  return date.toLocaleString('en-US', { timeZone: timezone })
}

function shortDateStr(date) {
  date = date || new Date()
  let short = date
    .toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    .split('/')
  const output = `${short[1]}-${short[0]}-${short[2]}`
  return output
}

module.exports = {
  sleep,
  newDate,
  shortAusDate,
  stringHash,
  timezoneString,
  shortDateStr
}
