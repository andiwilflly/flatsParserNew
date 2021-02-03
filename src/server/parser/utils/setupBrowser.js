const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


module.exports = async function () {
    return await puppeteer.launch({ headless: true });
}
