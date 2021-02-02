const CONFIG = require('../config.json');



module.exports = async function(browser, url) {

    console.log('DOMIK.UA PARSER:START');
   try {
       console.log('DOMIK.UA PARSER:END');
       return await parsePage(browser, url, 0, []);
   } catch(e) {
       console.log('✨DOMIK.UA PAGE ERROR | ', e);
       console.log('DOMIK.UA PARSER:ERROR');
       return {};
   }

}

async function parsePage(browser, url, number = 0, offers = []) {
    console.log('✨DOMIK.UA ENTER page:', number);

    const page = await browser.newPage();
    await page.goto(`${url}&page=${number * 35}`, {
        waitUntil: 'load',
        timeout: 0
    });

    const isEndOfPages = await page.evaluate(()=> {
        return ![...document.querySelectorAll('.objava') ].length;
    });

    if(number > 10 || isEndOfPages) return offers;

    const rows = await page.evaluate(()=> {
        return [...document.querySelectorAll('.objava') ].map($row => {
            return {
                id: $row.getAttribute('id') + $row.querySelector('.image').getAttribute('src'),
                img: `http://domik.ua${$row.querySelector('.image').getAttribute('src')}`,
                title: $row.querySelector('.tittle_obj > a').innerText,
                link: `http://domik.ua${$row.querySelector('.tittle_obj > a').getAttribute('href')}`,
                price: $row.querySelector('.commission').innerText,
                district: $row.querySelector('.h5_address').innerText,
                color: '#ff8d00',
                size: $row.querySelector('.objava_detal_info').innerText,
                address: $row.querySelector('.h5_address').innerText,
                source: 'domik.ua'
            };
        });
    });

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers);
}