// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
// const puppeteer = require('puppeteer')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// const fs = require('fs')
require('dotenv').config()

const url = 'https://www.ubank.com.au/ib#/login'
const { sleep } = require('./utils.js')

const defaultConfig = {
  headless: false,
  slowMo: 0,
  id: 'ubank',
  loadImages: true,
  sleepTime: 3000,
  // proxy: '103.83.95.122:32896'
  proxy: false
}

module.exports = scrape = async userConfig => {
  const config = { ...defaultConfig, ...userConfig }

  console.log(`${config.id}`)

  const browser = await puppeteer.launch({
    userDataDir: process.cwd() + '/pup_user_data',
    headless: config.headless,
    slowMo: config.slowMo,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      config.proxy ? `--proxy-server=${config.proxy}` : ``
    ]
  })

  const page = await browser.newPage()

  // removed assets besides 'script'
  page.on('request', request => {
    if (
      ['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1
    ) {
      request.abort()
    } else {
      request.continue()
    }
  })

  await page.setViewport({ width: 1200, height: 1000 }) // macbook pro 13' full screen

  await page.goto(url)
  // await page.goto('https://twitter.com/login?username_disabled=true')

  // await page.goto(url, { waitUntil: heroku ? 'networkidle' : 'networkidle2' })
  console.log('URL:', page.url())

  // Login
  await page.waitForSelector('#email')
  await page.type('#email', process.env.EMAIL)
  await page.type('#password', process.env.PASS)
  await page.click('#loginSubmit')

  // await page.waitForNavigation()
  await sleep(config.sleepTime)
  console.log('URL:', page.url())

  await page.waitForNavigation()
  await page.click('a[title="Mu\'s Ultra"]')
  await sleep(config.sleepTime)
  await page.waitForSelector('a.mildgreenBullet')
  await page.click('a.mildgreenBullet')
  await sleep(config.sleepTime)
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
    console.log('getting page...')
    let display = await page.evaluate(() => {
      return document.querySelector('a.btnNextPgn').style.display
    })
    console.log('display', display)
    finished = display === 'none'
    console.log('finished', finished)

    // get rows
    let data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('tr.af_table_data-row')).map(
        elem => elem.textContent
      )
    })
    console.log(data)
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
      console.log(matches)

      result.date = matches[1]
      result.desc = matches[2]
      result.amount = matches[3] + matches[4]
      result.bal = matches[5]

      return result
    })

    // add
    output = output.concat(results)
    console.log('output length:', output.length)

    if (!finished) {
      console.log('next page...')
      await page.click('a.btnNextPgn')
      await sleep(config.sleepTime)
    }
  }

  console.log(output)
  console.log('results length:', output.length)
  // fs.writeFileSync('./results.json', JSON.stringify(output))
  browser.close()
  return output
}
