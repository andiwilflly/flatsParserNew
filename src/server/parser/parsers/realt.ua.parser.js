const fetch = require('node-fetch');

async function f() {
    let response = await fetch("http://realt.ua/Db2/0Pr_Kv.php?Obl=10", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "uk-UA,uk;q=0.9,ru-UA;q=0.8,ru;q=0.7,en-US;q=0.6,en;q=0.5",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded; charset=utf-8",
            "upgrade-insecure-requests": "1"
        },
        "referrer": "http://realt.ua/Db2/0Pr_Kv.php?Obl=10",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "is_fReg=1&Obl0=10&IDR0=10&Reg0=%D8%E5%E2%F7%E5%ED%EA%EE%E2%F1%EA%E8%E9&FormNum=0&prg=Db2%2Fv_All_2.php&Opr=1&Obj=1&pv=2&fSmin=65&fSmax=110&Cn_min=60000&Cn_max=110000&fl_n_one=1&fl_n_end=1&idNp=100000&nTip=648&NpName=%25CA%25E8%25E5%25E2&IDR=10&valt=2&cnt_all=1672&num_show=20&posPOST=0&Obl=10&IDR0=10&IDR=10&Cn_min=60000&Cn_max=110000&valt=2&cnZaM=0&Rms_min=2&Rms_max=&fSmin=65&fSmax=110&FLMmin=&FLMmax=&fl_min=&fl_max=&TmSdch=0&sTel=&nDay=&vSps=1&fsbmtfReg=%CF%EE%E8%F1%EA",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });

    response = await response.text();
    console.log(response);
}
f();

// const url = `http://realt.ua/Db2/0Pr_Zm.php?Obl=10&${Object.keys(params).map(name => `${name}=${params[name]}`).join('&')}`;

// console.log(url);