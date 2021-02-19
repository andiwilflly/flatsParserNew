const cliProgress = require('cli-progress');
const fetch = require('node-fetch');
let progress = null;


module.exports = async function(browser, { url, info }) {
    console.log(`✨ ${info} PARSER:START`);
    const offers = await fetchPage(url, 0, [], info);
    progress.stop();

    return offers;
}


async function fetchPage(url, page = 0, allOffers, info) {
    let offers = await fetch(`${url}&page=${page}`);
    offers = await offers.json();

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(Math.ceil(offers.count / 20)-1, 0);
    }

    offers = offers.items;

    progress.update(page+1);
    if(!offers.length) return allOffers; // Last page reached

    offers = offers.map(offer => {
        return {
            id: offer.description ? offer.description.slice(0, 200) : (offer._id || offer.realty_id || offer.web_id),
            img: 'https://cdn.riastatic.com/photosnewr/ria/dom_news_logo/skolko-nuzhno-kopit-na-kvartiru-v-ukraine-dom-ria-sravnil-czeny-i-zar__213359-620x0.jpg',
            title: offer.description ? offer.description.slice(0, 200) : offer.realty_id,
            link: `https://dom.ria.com/ru/${offer.beautiful_url}`,
            address: `Киев, ${offer.street_name} ${offer.building_number_str}, ${offer.district_name} район`,

            price: offer.priceArr ? +offer.priceArr[1].replace(/ /g, '') : +offer.price_total,
            floor: offer.floor,
            rooms: offer.rooms_count,
            square: offer.total_square_meters,

            source: info,

            longitude: offer.longitude,
            latitude: offer.latitude,
            description: offer.description
        }
    });

    return await fetchPage(url, page+1, [...allOffers, ...offers], info);
}