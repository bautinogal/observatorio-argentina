const axios = require('axios');
const fs = require('fs');


async function fetchData() {
    const cacResponse = await axios.get('https://prestamos.ikiwi.net.ar/api/cacs');
    const uvaResponse = await axios.get("https://prestamos.ikiwi.net.ar/api/v1/engine/uva/valores/");
    const uviResponse  = await axios.get("https://prestamos.ikiwi.net.ar/api/v1/engine/uvi/valores/");
    const dolaritoResponse = await fetch("https://www.dolarito.ar/api/frontend/history", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "auth-client": "d57031be4259d66bccf3ec5c675afdee",
            "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "Referer": "https://www.dolarito.ar/cotizaciones-historicas/informal",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });


    const datosCAC = cacResponse.data;
    const datosUVA = uvaResponse.data;
    const datosUVI = uviResponse.data;
    const datosDolarito = await dolaritoResponse.json();

    const indexes = Object.entries(datosDolarito).map(([k, v], i) => {

        const [day, month, year] = k.split('-');

        const cacIndex = datosCAC.find(x => {
            const [_year, _month, _day] = x.period.split('-');
            return _month === month && _year.slice(2, 4) === year;
        });

        const uvaIndex = datosUVA.find(x => {
            const [_day, _month, _year] = x.fecha.split('-');
            return _day === day && _month === month && _year.slice(2, 4) === year;
        });

        const uviIndex = datosUVI.find(x => {
            const [_day, _month, _year] = x.fecha.split('-');
            return _day === day && _month === month && _year.slice(2, 4) === year;
        });

        return {
            date: new Date(`${'20' + year}-${month}-${day}`).toISOString(),
            ...v,
            cac: cacIndex,
            uva: uvaIndex?.valor,
            uvi: uviIndex?.valor
        }
    });


    fs.writeFileSync('indexes.json', JSON.stringify(indexes))

}

fetchData();