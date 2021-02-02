const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const parser = require('./parser/parser');



const express = require('express');
const app = express();
const port = 4000;

const adapter = new FileSync('DB.json');
global.DB = low(adapter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/start-parser', (req, res) => {
    parser.start();
    res.send(200);
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})