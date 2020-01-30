require('dotenv').config()

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require('puppeteer-extra')
// const puppeteer = require('puppeteer')

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const proxy = false // or provide proxy ip address

async function pup() {
  puppeteer.use(StealthPlugin())

  const browser = await puppeteer.launch({
    // headless: process.env.NODE_ENV === 'production',
    headless: false,
    userDataDir: process.cwd() + '/pup_user_data',
    slowMo: 0,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      proxy ? `--proxy-server=${proxy}` : ``
    ]
  })

  // grab the first and only page opened
  const [page] = await browser.pages() // returns an array of pages
  // const page = await browser.newPage()

  // if I want to emulate a device with userAgent info
  // const devices = require('puppeteer/DeviceDescriptors');
  // await page.emulate(devices['iPhone X']);

  // can also grab details from my own computer via dev tools looking at 'Navigator' object
  await page.setViewport({ width: 1200, height: 1000 }) // macbook pro 13' full screen

  // set brisbane location
  // navigator.geolocation.getCurrentPosition(({coords}) => console.info(coords))
  // await page.setGeolocation({ latitude: -27.4515, longitude: 153.058 })

  // listen to console log on client side if we write 'pup:'
  page.on('console', msg => {
    if (msg._text.match(/pup:/gi)) {
      console.log(`${msg._text}`.brightYellow)
    }
  })

  // avoid uneccessary payload
  // await page.setRequestInterception(true)
  // page.on('request', r => {
  //   if (
  //     // ['image', 'stylesheet', 'font', 'script'].indexOf(r.resourceType()) !== -1
  //     ['image', 'stylesheet', 'font'].indexOf(r.resourceType()) !== -1
  //   ) {
  //     r.abort()
  //   } else {
  //     r.continue()
  //   }
  // })

  // // don't load images
  // if (!loadImages) {
  //   page.on('request', request => {
  //     if (request.resourceType() === 'image') {
  //       request.abort()
  //     } else {
  //       request.continue()
  //     }
  //   })
  // }

  return { browser, page }
}

module.exports = { pup }
