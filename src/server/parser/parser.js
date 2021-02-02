const CONFIG = require('./config.json');
const setupBrowser = require('./utils/setupBrowser');
const geoCoder = require('./utils/geoCoder');

const parsers = {
    'domik.ua': require('./parsers/domik.ua.parser')
};



module.exports = {

    async start() {
        let offers = [];
        const browser = await setupBrowser();
        for(const parser of  CONFIG.parsers) {
            console.log('parser:', parsers[parser.name]);
            offers = [ ...offers, ...await parsers[parser.name](browser, parser.url) ];
        }
        browser.close();

        const offersDB = global.DB.get('offers');
        const oldOffers = offers
            .filter(offer => offersDB.find({ id: offer.id }).value())
            .map(offer => ({ ...offer, createdAt: Date.now() }));

        let newOffers = offers
            .filter(offer => !offersDB.find({ id: offer.id }).value())
            .map(offer => ({ ...offer, createdAt: Date.now() }));

        // Save new offers to DB
        newOffers = await geoCoder(newOffers);
        newOffers.forEach(offer => offersDB.push(offer).write());

        console.log('offers: ', offers.length, 'oldOffers:', oldOffers.length, 'newOffers (filtered)', newOffers.length);
    },

    stop() {

    }
};