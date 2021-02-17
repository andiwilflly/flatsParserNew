const cliProgress = require('cli-progress');
let progress = null;


let totalPages = 0;
module.exports = async function(browser, { url, info }) {
    progress = null;
    totalPages = 0;
    console.log(`✨ ${info} PARSER:START`);
    try {
        const offers = await parsePage(browser, url, 1, [], info);
        progress.stop();
        return offers;
    } catch(e) {
        console.log(`✨ ${info} PARSER: PAGE ERROR | `, e);
        progress.stop();
        return [];
    }

}


async function parsePage(browser, url, number = 0, offers = [], info) {
    const page = await browser.newPage();
    await page.goto(`${url}?page=${number}`, {
        // waitUntil: 'load',
        // timeout: 0
    });

    totalPages = totalPages || await page.evaluate(()=> {
        const $links = document.querySelectorAll('.pager-item');
        if(!$links) return totalPages;
        return +$links[$links.length-2].innerText
    });

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(totalPages-1, 0);
    } else {
        progress.increment();
    }

    if(totalPages <= number) return offers;

    const rows = await page.evaluate((_info)=> {
        return [...document.querySelectorAll('.realty-object-card') ].map($row => {
            const link = $row.querySelector('.object-address > a') && $row.querySelector('.object-address > a').getAttribute('href');
            if(!link) return;
            return {
                id: link,
                img: $row.querySelector('.slides__item img') ? $row.querySelector('.slides__item img').getAttribute('src') : 'https://www.samsung.com/etc/designs/smg/global/imgs/support/cont/NO_IMG_600x600.png',
                title: $row.querySelector('.object-address > a').innerText,
                link: `https://100realty.ua${link}`,
                address: $row.querySelector('.object-address > a').innerText,

                price: parseInt($row.querySelector('.usd-price-value').innerText.replace(/ /g, '').match(/\d+/g)[0]),
                floor: 0,
                rooms: parseInt($row.querySelector('.object-rooms .value').innerText.replace(/ /g, '').match(/\d+/g)[0]),
                square: parseInt($row.querySelector('.object-square .value').innerText.replace(/ /g, '').match(/\d+/g)[0]),
                description: $row.querySelector('.descr').innerText,

                source: _info
            }
        }).filter(Boolean);
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url, number+1, offers, info);
}