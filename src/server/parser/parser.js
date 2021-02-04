const CONFIG = require('./config.json');
const setupBrowser = require('./utils/setupBrowser');
const geoCoder = require('./utils/geoCoder');

const parsers = {
    'domik.ua': require('./parsers/domik.ua.parser'),
    'dom.ria': require('./parsers/dom.ria.parser'),
    'bn.ua': require('./parsers/bn.ua.parser'),
    'olx.ua': require('./parsers/olx.ua.parser')
};



module.exports = {

    async start() {
        let offers = [];
        const browser = await setupBrowser();
        for(const parser of  CONFIG.parsers) {
            offers = [ ...offers, ...await parsers[parser.name](browser, parser) ];
        }
        browser.close();

        // Deduplicate offers
        console.log('before: ', offers.length);
        offers = [...new Set(offers.map(offer => offer.id))]
            .map(offerId => offers.find(offer => offer.id === offerId))
            .filter(offer => offer.floor ? offer.floor[0] !== offer.floor[1] : true);
        console.log('after: ', offers.length);

        const offersDB = global.DB.get('offers');
        let oldOffers = offers
            .map(offer => offersDB.find({ id: offer.id }).value()).filter(Boolean);

        let newOffers = offers
            .filter(offer => !offersDB.find({ id: offer.id }).value())
            .map(offer => ({ ...offer, createdAt: Date.now() }));

        // Clear DB offers
        global.DB.get('offers').remove().write();
        // Save old offers to DB
        oldOffers.forEach(offer => offersDB.push(offer).write());
        // Save new offers to DB
        newOffers = await geoCoder(newOffers);
        newOffers.forEach(offer => offersDB.push(offer).write());

        console.log('offers: ', offers.length, 'oldOffers:', oldOffers.length, 'newOffers (filtered)', newOffers.length);
    },

    stop() {

    }
};