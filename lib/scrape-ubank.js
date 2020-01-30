require('dotenv').config()

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
// const puppeteer = require('puppeteer')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const url = 'https://www.ubank.com.au/ib#/login'
const { pup } = require('./pup.js')
require('colors')
const { sleep, newDate, stringHash } = require('./utils.js')
const sleepDuration = 3000

const scrapeUbank = async () => {
  console.log(`UBANK`.yellow)

  const { browser, page } = await pup()

  await page.goto(url)
  // await page.goto('https://twitter.com/login?username_disabled=true')

  // await page.goto(url, { waitUntil: heroku ? 'networkidle' : 'networkidle2' })
  console.log('URL:'.cyan, page.url())

  // Login
  await page.waitForSelector('#email')
  await page.type('#email', process.env.UBANK_EMAIL)
  await page.type('#password', process.env.UBANK_PASS)
  await page.click('#loginSubmit')

  // await page.waitForNavigation()
  await sleep(sleepDuration)
  console.log('URL:'.cyan, page.url())

  await page.waitForNavigation()
  await page.click('a[title="Mu\'s Ultra"]')
  await sleep(sleepDuration)
  await page.waitForSelector('a.mildgreenBullet')
  await page.click('a.mildgreenBullet')
  await sleep(sleepDuration)
  // await page.waitForSelector('td.af_column_data-cell')
  await page.waitForNavigation()

  /*
       19/12/2019_dfs["pt1:r1:0:uipt1:subForm:t1:28:d1:dtDate"]='dd/MM/yyyy';_dl["pt1:r1:0:uipt1:subForm:t1:28:d1:dtDate"]=null;`,
      'Sweep from 373848952',
      '+Amount$122.65',
      'Balance$623.65CR'

       19/12/2019_dfs["pt1:r1:0:uipt1:subForm:t1:28:d1:dtDate"]='dd/MM/yyyy';_dl["pt1:r1:0:uipt1:subForm:t1:28:d1:dtDate"]=null;Sweep from 373848952+Amount$122.65Balance$623.65CR
    */

  let output = []
  let finished = false
  while (!finished) {
    console.log(`${output.length}`.yellow + ` ts`)
    // console.log('getting page...')
    let display = await page.evaluate(() => {
      return document.querySelector('a.btnNextPgn').style.display
    })
    // console.log('display', display)
    finished = display === 'none'
    // console.log('finished', finished)

    // get rows
    let data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tr.af_table_data-row')).map(
        elem => elem.textContent
      )
    })
    // console.log(data)
    // second page rows
    // `19/12/2019V0432 17/12 GOLD BRANDS PTY LTD      RICH Ref: 74940529351-Amount$52.27Balance$501.00CR`

    // format
    let results = data.map(str => {
      let result = {}
      let matches
      if (str.includes('null')) {
        matches = str.match(
          /(\d+\/\d+\/\d+).+=null;(.+)([+|-])Amount(.+)Balance(.+)/
        )
      } else {
        matches = str.match(/(\d+\/\d+\/\d+)(.+)([+|-])Amount(.+)Balance(.+)/)
      }
      // console.log(matches)

      result.date = matches[1]
      result.desc = matches[2]
      result.amount = matches[3] + matches[4]
      result.bal = matches[5]

      return result
    })

    // add
    output = output.concat(results)
    // console.log('output length:', output.length)

    if (!finished) {
      // console.log('next page...')
      await page.click('a.btnNextPgn')
      await sleep(sleepDuration)
    }
  }

  // console.log(output)
  console.log(`${output.length} transactions scraped.`.bold.yellow)

  browser.close()
  return output
}

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

module.exports = { scrapeUbank, formatUbank }
