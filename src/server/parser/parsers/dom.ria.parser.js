const cliProgress = require('cli-progress');
const fetch = require('node-fetch');
let progress = null;


module.exports = async function(browser, url) {
    const offers = await fetchPage(url, 0, []);
    progress.stop();

    return offers;
}


async function fetchPage(url, page = 0, allOffers) {
    let offers = await fetch(`${url}&page=${page}`);
    offers = await offers.json();

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(Math.round(offers.count / 20), 0);
    }

    offers = offers.items;

    progress.update(page+1);
    if(!offers.length) return allOffers; // Last page reached

    offers = offers.map(offer => {
        return {
            id: offer.description.slice(0, 200),
            img: 'https://cdn.riastatic.com/photosnewr/ria/dom_news_logo/skolko-nuzhno-kopit-na-kvartiru-v-ukraine-dom-ria-sravnil-czeny-i-zar__213359-620x0.jpg',
            title: offer.description.slice(0, 50),
            link: `https://dom.ria.com/ru/${offer.beautiful_url}`,
            address: `Киев, ${offer.street_name} ${offer.building_number_str}, ${offer.district_name} район`,

            price: offer.priceArr ? +offer.priceArr[1].replace(/ /g, '') : +offer.price_total,
            floor: offer.floor,
            rooms: offer.rooms_count,
            square: offer.total_square_meters,

            source: 'dom.ria',

            longitude: offer.longitude,
            latitude: offer.latitude,
            description: offer.description
        }
    });

    return await fetchPage(url, page+1, [...allOffers, ...offers]);
}

// module.exports = async function(browser, url) {
//
//     console.log('✨ DOM.RIA PARSER:START');
//    try {
//        const offers = await parsePage(browser, url, 1, []);
//       // progress.stop();
//        return offers;
//    } catch(e) {
//        console.log('✨ DOM.RIA PAGE ERROR | ', e);
//       // progress.stop();
//        return {};
//    }
// }
//
//
// let totalPages = 10;
// async function parsePage(browser, url, number = 0, offers = []) {
//     const context = browser.defaultBrowserContext();
//     context.overridePermissions("https://dom.ria.com", ["geolocation", "notifications"]);
//
//     const page = await browser.newPage();
//
//     if(number === 0) {
//         await page.goto(`${url}`, {
//             //waitUntil: 'networkidle2'
//         });
//     } else {
//         await page.goto(`${url}`, {
//             //waitUntil: 'networkidle2'
//         });
//         await page.waitForTimeout(3000);
//         await page.evaluate((_number)=> {
//             [...document.querySelectorAll('.page-link:not(.hide)')].forEach($link => {
//
//                 if($link.innerText === _number) $link.click();
//             });
//         }, `${number}`);
//     }
//
//     await page.waitForTimeout(3000);
//     await page.screenshot({path: `page${number}.png`});
//
//     totalPages = totalPages || await page.evaluate(()=> {
//         return Math.max(...[...document.querySelectorAll('.pagerMobileScroll .page-link')]
//             .map($link => +$link.innerText).filter(Boolean));
//     });
//
//     // if(!progress) {
//     //     progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
//     //     progress.start(totalPages, 0);
//     // } else {
//     //     progress.update(number);
//     // }
//
//     if(totalPages <= number) return offers;
//
//     const rows = await page.evaluate(()=> {
//         return [...document.querySelectorAll('.ticket-clear') ].map($row => {
//             const link = $row.querySelector('.size18 .blue') && $row.querySelector('.size18 .blue').getAttribute('href');
//             if(!link) return;
//             return {
//                 id: $row.querySelector('.size18 .blue').innerText,
//                 img: $row.querySelector('.loaded img') ? $row.querySelector('.loaded img').getAttribute('src') : 'https://www.samsung.com/etc/designs/smg/global/imgs/support/cont/NO_IMG_600x600.png',
//                 title: $row.querySelector('.size18 .blue').innerText,
//                 link: 'https://dom.ria.com' + link,
//                 address: $row.querySelector('.size18 .blue').innerText,
//
//                 price: parseInt($row.querySelector('.size22').innerText.replace(/\$/g, '').replace(/ /g, '')),
//                 floor: null,
//                 rooms: parseInt($row.querySelector('.char > .i-block').innerText.replace(/\$/g, '').replace(/ /g, '')),
//                 square: parseInt($row.querySelectorAll('.char > .i-block')[1].innerText.replace(/\$/g, '').replace(/ /g, '')),
//
//                 source: 'dom.ria'
//             }
//         }).filter(Boolean);
//     });
//
//     rows.forEach(row => offers.push(row));
//
//     await page.close();
//     return await parsePage(browser, url,number+1, offers);
// }