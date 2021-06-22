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
        if(progress) progress.stop();
        return [];
    }

}

async function parsePage(browser, url, number = 0, offers = [], info) {
    const page = await browser.newPage();
    await page.goto(`${url}&page=${number}`, {
        // waitUntil: 'load',
        // timeout: 0
    });

    // Small site (~1-2 pages) - no need to parse more than 4
    const isLastPage = number > 3 || await page.evaluate(()=> {
        return ![...document.querySelectorAll('.listingv2 .listgrid')].length;
    });

    if(!progress) {
        progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        progress.start(4, 0);
    } else {
        progress.increment();
    }

    if(isLastPage) return offers;

    const rows = await page.evaluate((_info)=> {
        return [...document.querySelectorAll('.listingv2 .listgrid')].map($item => {
            const $img = $item.querySelector('.owl-item.active img');
            const $floor = $item.querySelector('.listingv2-paramblock-left .listingv2-param-floor');
            const $square = $item.querySelector('.listingv2-paramblock-left .listingv2-param-areas');
            const link = $item.querySelector('a').getAttribute('href');
            const isNotReady = $item.querySelector('.listingv2-paramblock-right .listingv2-param.listingv2-ellipsed').innerText.includes('Термін виплат');

            if(isNotReady) return null;
            return {
                id: (link.startsWith('http') ? link : `https://bn.ua${link}`) + $item.querySelector('.listingv2-param-addr').innerText,
                img: $img ? `https://bn.ua${$img.getAttribute('src')}` : '',
                title: $item.querySelector('.listingv2-param-addr').innerText,
                link: link.startsWith('http') ? link : `https://bn.ua${link}`,
                address: `Киев, ${$item.querySelector('.listingv2-param-addr').innerText}`,
                price: +$item.querySelector('.val').innerText.replace(/ /g, '').match(/\d+/g)[0],
                floor: $floor ? $floor.innerText.match(/\d+/g).map(f => +f) : 0,
                rooms: +$item.querySelector('.listingv2-paramblock-left .listingv2-param-rooms').innerText.match(/\d+/g)[0],
                square: $square ? +$square.innerText.match(/\d+/)[0] : 0,

                source: _info
            }
        }).filter(Boolean);
    }, info);

    rows.forEach(row => offers.push(row));

    await page.close();
    return await parsePage(browser, url,number+1, offers, info);
}
