const cliProgress = require('cli-progress');
let progress = null;


module.exports = async function(browser, url) {

    console.log('✨ DOMIK.UA PARSER:START');
   try {
       const offers = await parsePage(browser, url, 0, []);
       progress.stop();
       return offers;
   } catch(e) {
       console.log('✨ DOMIK.UA PAGE ERROR | ', e);
       progress.stop();
       return {};
   }

}

async function parsePage(browser, url, number = 0, offers = []) {
    const page = await browser.newPage();
    await page.goto(`${url}&page=${number * 35}`, {
        waitUntil: 'load',
        timeout: 0
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

    const rows = await page.evaluate(()=> {
        return [...document.querySelectorAll('.objava') ].map($row => {
            return {
                id: $row.getAttribute('id') + $row.querySelector('.image').getAttribute('src'),
                img: `http://domik.ua${$row.querySelector('.image').getAttribute('src')}`,
                title: $row.querySelector('.tittle_obj > a').innerText,
                link: `http://domik.ua${$row.querySelector('.tittle_obj > a').getAttribute('href')}`,
                price: parseInt($row.querySelector('.commission').innerText.replace(/\$/g, '').replace(/ /g, '')),
                address: $row.querySelector('.h5_address').innerText,
                floor: $row.querySelector('.objava_detal_info').innerText.match(/Этаж: ?\d+\/\d+/g)[0].match(/\d+/g).map(f => +f),
                square: +[...$row.querySelectorAll('.objava_detal_info .color-gray')].find($el => $el.innerText.includes('Площадь')).innerText.split(':')[1].split('/')[0],
                source: 'domik.ua'
            };
        });
    });

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers);
}