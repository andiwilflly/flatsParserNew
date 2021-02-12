const cliProgress = require('cli-progress');
let progress = null;


module.exports = async function(browser, { url, info }) {

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


let totalPages = 0;
async function parsePage(browser, url, number = 0, offers = [], info) {
    const page = await browser.newPage();
    await page.goto(`${url}?page=${number}`, {
        // waitUntil: 'load',
        // timeout: 0
    });

    totalPages = totalPages || await page.evaluate(()=> {
        return Math.max(...[...document.querySelectorAll('.pagination_custom li')].map($el => +$el.innerText));
    });

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(totalPages, 0);
    } else {
        progress.increment();
    }

    if(totalPages < number) return offers;

    const rows = await page.evaluate((_info)=> {
        return [...document.querySelectorAll('.catalog-item') ].map($row => {
            return {
                id: $row.querySelector('.catalog-item__title a').innerText,
                img: $row.querySelector('.catalog-item__img img').getAttribute('src'),
                title: $row.querySelector('.catalog-item__title a').innerText,
                link: `https://rieltor.ua${$row.querySelector('.catalog-item__title a').getAttribute('href')}`,
                address: `Киев, ${$row.querySelector('.catalog-item__title a').innerText}`,

                price: parseInt($row.querySelector('.catalog-item__price').innerText.replace(/ /g, '').match(/\d+/g)[0]),
                floor: 0,
                rooms: '',
                square: '',
                description: $row.querySelector('.catalog-item_info-description').innerText,

                source: _info
            }
        });
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url, number+1, offers, info);
}