const cliProgress = require('cli-progress');


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
    await page.goto(`${url}?page=${number}`, {
       // waitUntil: 'networkidle2'
    });

    totalPages = totalPages || await page.evaluate(()=> {
        return Math.max(...[...document.querySelectorAll('.pagination__link')].map($el => $el.innerText));
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
        return [...document.querySelectorAll('.catalog-item') ].map($row => {
            return {
                id: $row.querySelector('img').getAttribute('src'),
                img: $row.querySelector('img').getAttribute('src'),
                title: $row.querySelector('.link').innerText,
                link: `https://parklane.ua${$row.querySelector('a').getAttribute('href')}`,
                address: $row.querySelector('.link').innerText,

                price: +$row.querySelector('.price-switch').innerText.replace("$", '').replace(/ /g, ''),
                floor: [+$row.querySelector('.floor > span').innerText.split('/')[0], +$row.querySelector('.floor > span').innerText.split('/')[1]],
                rooms: +$row.querySelector('.rooms > span').innerText,
                square: +$row.querySelector('.square > span').innerText,

                source: _info
            }
        });
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}