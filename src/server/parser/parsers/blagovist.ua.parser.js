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
        return Math.max(...[...document.querySelectorAll('.pager-item')].map($el => +$el.innerText).filter(Boolean));
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
        return [...document.querySelectorAll('.search-item')].map($row => {
            return {
                id: $row.querySelector('.h4').innerText,
                img: $row.querySelectorAll('img')[1].getAttribute('src'),
                title: $row.querySelector('.h4').innerText,
                link: $row.querySelector('.h4 a').getAttribute('href'),
                address: $row.querySelector('.h4').innerText.split('м²,')[1],
                price: +$row.querySelector('.m-dollar').innerHTML.replace(/(<([^>]+)>)/ig, '').replace(/ /g, '').split('$')[0],
                floor: 0,
                rooms: +$row.querySelector('.h4').innerText[0],
                square: 0,

                description: `${$row.querySelector('.region').innerText}. ${$row.querySelector('.info-text').innerText}`,

                source: _info
            }
        });
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}