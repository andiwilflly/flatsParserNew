const cliProgress = require('cli-progress');
const recognizeAddress = require('../utils/recognizeAddress');


let progress = null;

let totalPages = 0;
module.exports = async function(browser, { url, info }) {

    progress = null;
    totalPages = 0;
    console.log(`✨ ${info} PARSER:START`);
   try {
       const offers = await parsePage(browser, url, 0, [], info);
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
    await page.goto(`${url}&page=${number}`, {
       // waitUntil: 'networkidle2'
    });

    totalPages = totalPages || await page.evaluate(()=> {
        return Math.max(...[...document.querySelectorAll('.item.fleft')].map($item => +$item.innerText));
    });

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(totalPages, 0);
    } else {
        progress.update(number);
    }

    if(totalPages <= number) {
        await page.close();
        return offers;
    }

    let rows = await page.evaluate((_info)=> {
        return [...document.querySelectorAll('#offers_table tr.wrap') ].map($row => {
            return {
                id: $row.querySelector('.link').innerText,
                img: $row.querySelector('.fleft') ? $row.querySelector('.fleft').getAttribute('src') : 'https://www.samsung.com/etc/designs/smg/global/imgs/support/cont/NO_IMG_600x600.png',
                title: $row.querySelector('.link').innerText,
                link: $row.querySelector('.link').getAttribute('href'),
                address: $row.querySelector('.bottom-cell .breadcrumb.x-normal').innerText.trim(),

                price: parseInt($row.querySelector('.price').innerText.replace(/\$/g, '').replace(/ /g, '')),
                floor: 0,
                rooms: null,
                square: 0,

                source: _info
            }
        });
    }, info);

    // Hate OLX title!
    rows = rows.map(offer => ({
        ...offer,
        address: `${recognizeAddress(offer)}, Київ, 02095, Україна`
    }));

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}