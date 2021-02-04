const Fuse = require('fuse.js');
const kievStreets = require('./kievData/kievStreets.json');
const kievPlaces = require('./kievData/kievPlaces.json');


module.exports = function recognize(offer) {

    const subwayMatch = Object.keys(kievPlaces.subways).find(subway => offer.title.includes(subway) ? subway : null);

    // Streets
    let streetMatch = kievStreets.filter(street => offer.title.includes(`${street}`) ? street : null);

    // Case when we have subway Житомирская and streets like: [Житомирская, Полевая, Хуевая]
    if(subwayMatch && streetMatch.length > 1) {
        streetMatch = streetMatch.filter(street => street !== subwayMatch);
    }

    streetMatch = streetMatch.sort(function (a, b) { return b.length - a.length; })[0];
    if(streetMatch && streetMatch.length >= 4) {
        let sub = 'улица ';
        if(offer.title.includes('Ул.') || offer.title.includes('ул') || offer.title.includes('вул')) sub = 'улица';
        if(offer.title.includes('пл.')) sub = 'площадь';
        if(offer.title.includes('пл ')) sub = 'площадь';
        if(offer.title.includes(' пл')) sub = 'площадь';
        if(offer.title.includes('пер')) sub = 'переулок';
        if(offer.title.includes('просп')) sub = 'проспект';
        if(offer.title.includes('Пр-кт')) sub = 'проспект';
        if(offer.title.includes('пр-кт')) sub = 'проспект';
        if(offer.title.includes('П. ')) sub = 'проспект';
        if(offer.title.includes(' пр')) sub = 'проспект';
        if(offer.title.includes(' М.')) sub = 'метро';
        if(offer.title.includes('бульв')) sub = 'бульвар';
        if(offer.title.includes('бульвар')) sub = 'бульвар';
        if(offer.title.includes('спуск')) sub = 'спуск';
        if(offer.title.includes('шоссе')) sub = 'шоссе';
        if(offer.title.includes('дор ')) sub = 'дорога';
        if(offer.title.includes('наб ')) sub = 'набережная';
        if(offer.title.includes(' наб')) sub = 'набережная';
        if(offer.title.includes(' проезд')) sub = 'проезд';
        if(offer.title.includes(' шоссе')) sub = 'шоссе';
        if(offer.title.includes(' ш. ')) sub = 'шоссе';

        const houseNumberStr = ` ${offer.title.split(streetMatch)[1]}`;
        const houseNumber = houseNumberStr.match(/[ ][\d\/]+[-]?[\W\w]/);

        return `${sub} ${streetMatch} ${houseNumber || ''}`;
    } else


        // Subways
    if(subwayMatch) {
        return kievPlaces.subways[subwayMatch];
    }


    // JK
    if(
        (
            offer.title.match('ЖК ') ||
            offer.title.match('жк.') ||
            offer.title.match('ЖК.') ||
            offer.title.match('жк ')
        )
        && offer.title.match(/(жк|ЖК)[ ][\D][^,.]+/)
    ) {
        const match = offer.title.match(/(жк|ЖК)[ ][\D][^,.]+/);
        return `ЖК ${match[0].replace(/ЖК/g, '').replace(/жк/g, '').replace(/ /g, '')}`;
    }


    // Districts
    let options = {
        shouldSort: false,
        includeScore: false,
        includeMatches: false, // TODO
        threshold: 0.3,
        location: 0,
        distance: 200,
        maxPatternLength: 200,
        minMatchCharLength: 3,
        keys: ["title"]
    };
    let fuse = new Fuse([offer], options);
    const districtMatch = kievPlaces.districts.find(district => fuse.search(district).length);
    if(districtMatch) {
        return `район ${districtMatch}`;
    }

    return offer.address;
}
