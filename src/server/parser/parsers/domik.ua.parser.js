const cliProgress = require('cli-progress');
let progress = null;


module.exports = async function(browser, { url, info }) {

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
    await page.goto(`${url}&page=${number * 35}`, {
        // waitUntil: 'load',
        // timeout: 0
    });

    const totalPages = Math.round(await page.evaluate(()=> {
        return parseInt(document.querySelector('.sort_p_item').innerText);
    }) / 35);

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(totalPages, 0);
    } else {
        progress.update(number);
    }

    if(totalPages <= number) return offers;

    const rows = await page.evaluate((_info)=> {
        return [...document.querySelectorAll('.objava') ].map($row => {
            return {
                id: $row.querySelector('.tittle_obj > a').innerText,
                img: `http://domik.ua${$row.querySelector('.image').getAttribute('src')}`,
                title: $row.querySelector('.tittle_obj > a').innerText,
                link: `http://domik.ua${$row.querySelector('.tittle_obj > a').getAttribute('href')}`,
                address: $row.querySelector('.h5_address').innerText,

                price: parseInt($row.querySelector('.commission').innerText.replace(/\$/g, '').replace(/ /g, '')),
                floor: $row.querySelector('.objava_detal_info').innerText.match(/Этаж: ?\d+\/\d+/g)[0].match(/\d+/g).map(f => +f),
                rooms: null,
                square: +[...$row.querySelectorAll('.objava_detal_info .color-gray')].find($el => $el.innerText.includes('Площадь')).innerText.split(':')[1].split('/')[0],

                source: _info
            };
        });
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}