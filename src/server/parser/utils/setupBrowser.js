const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');

// puppeteer.use(StealthPlugin());
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));


module.exports = async function () {
    return await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ["--mute-audio", "--hide-scrollbars"],
        devtools: false, // not needed so far, we can see websocket frames and xhr responses without that.
        args: [
            '--no-sandbox', // meh but better resource comsuption
            '--disable-setuid-sandbox'
        ]
    });
}
