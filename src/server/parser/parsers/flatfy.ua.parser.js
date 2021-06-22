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
       if(progress) progress.stop();
       return [];
   }

}


async function parsePage(browser, url, number = 0, offers = [], info) {
    const page = await browser.newPage();
    await page.goto(`${url}&page=${number}`, {
        waitUntil: 'networkidle2'
    });


    totalPages = totalPages || await page.evaluate(()=> {
        return Math.max(...[...document.querySelectorAll('.paging-button')].map($link => +$link.innerText));
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
        return [...document.querySelectorAll('.realty-block__wrapper') ].map($row => {
            const $price = $row.querySelector('.realty-preview__price') ;
            if(!$price) return;

            let link = $row.querySelector('.realty-preview__content-link').getAttribute('href');
            if(link.match('/uk/redirect')) link = `https://flatfy.ua${link}`;
            return {
                id: link,
                img: 'https://static.flatfy.com/static/spa/media/lun-flatfy-black.44656c58.svg',
                title: $row.querySelector('.realty-preview__title-link').innerText,
                link,
                address: `Киев, ${$row.querySelector('.realty-preview__title-link').innerText}`,

                description: $row.querySelector('.realty-preview__description') ? $row.querySelector('.realty-preview__description').innerText : null,

                price: +$price.innerText.replace(/\$/g, '').replace(/ /g, '').match(/\d+/g).join(''),
                floor: 0,
                rooms: +$row.querySelector('.rooms').innerText.match(/\d+/g)[0],
                square: 0,

                source: _info
            }
        }).filter(Boolean);
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}
