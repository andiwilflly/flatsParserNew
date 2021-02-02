const fetch = require('node-fetch');
const cliProgress = require('cli-progress');

function geoCoderUrl(address) {
    return `https://geocoder.ls.hereapi.com/6.2/geocode.json?xnlp=CL_JSMv3.1.14.0&apikey=yNXTO7pg5KdL_J8_BkDe0_PUDGfbTdwagSXAUs37pTY&searchText=${encodeURIComponent(address)}&jsonattributes=1`;
}

module.exports = async function(offers) {
    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_grey);
    progress.start(offers.length-1, 0);

    let parsedOffers = await Promise.all(offers.map(async (offer, i)=> {
        try {
            return fetch(geoCoderUrl(offer.address))
                .then(response => response.json())
                .then(geo => {
                    progress.increment();

                    if(!geo.response.view[0]) return { geo: { relevance: 0 } };
                    return {
                        ...offer,
                        geo: {
                            relevance: geo.response.view[0].result[0].relevance,
                            ...geo.response.view[0].result[0].location
                        }
                    }
                })
        } catch(e) {
            return { geo: { relevance: -1 } };
        }
    }));

    progress.stop();
    return [
        ...parsedOffers.filter(offer => offer.geo.relevance > 0.50)
    ];
}