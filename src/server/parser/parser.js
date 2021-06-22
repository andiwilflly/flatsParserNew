const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const CONFIG = require('./config.json');
const setupBrowser = require('./utils/setupBrowser');
const geoCoder = require('./utils/geoCoder');

const parsers = {
    'domik.ua': require('./parsers/domik.ua.parser'),
    'dom.ria': require('./parsers/dom.ria.parser'),
    'bn.ua': require('./parsers/bn.ua.parser'),
    'olx.ua': require('./parsers/olx.ua.parser'),
    '100realty.ua': require('./parsers/100realty.ua.parser'),
    'rieltor.ua': require('./parsers/rieltor.ua.parser'),
    'blagovist.ua': require('./parsers/blagovist.ua.parser'),
    'parklane.ua': require('./parsers/parklane.ua.parser'),
    'flatfy.ua': require('./parsers/flatfy.ua.parser')
};


module.exports = {
    async start() {
        let offers = [];
        const browser = await setupBrowser();
        for (const parser of CONFIG.parsers) {
            offers = [...offers, ...await parsers[parser.name](browser, parser)];
        }
        browser.close();

        // Deduplicate offers
        console.log('before: ', offers.length);
        offers = [...new Set(offers.map(offer => offer.id))]
            .map(offerId => offers.find(offer => offer.id === offerId))
        // .filter(offer => offer.floor ? offer.floor[0] !== offer.floor[1] : true);
        console.log('after: ', offers.length);

        const offersDB = global.DB.getData('/offers');

        let oldOffers = offers
            .map(offer => offersDB.find((o) => o.id === offer.id)).filter(Boolean);

        let newOffers = offers
            .filter(offer => !offersDB.find((o) => o.id === offer.id))
            .map(offer => ({...offer, createdAt: Date.now()}));

        // Clear DB offers
        global.DB.push("/offers", []);

        // Save old offers to DB
        oldOffers.forEach(offer => {
            global.DB.push(`/offers[]`, offer, true);
        });
        // Save new offers to DB
        newOffers = await geoCoder(newOffers);
        newOffers.forEach(offer => {
            global.DB.push(`/offers[]`, offer, true);
        });

        const types = [...oldOffers, ...newOffers].reduce((res, offer) => {
            res[offer.source.split('|')[0]] = res[offer.source.split('|')[0]] ? res[offer.source.split('|')[0]] + 1 : 1;
            return res;
        }, {});

        console.table(types);

        global.DB.save();

        console.log('offers: ', offers.length, 'oldOffers:', oldOffers.length, 'newOffers (filtered)', newOffers.length);

        return offers.length;
    }
}
