const low = require('lowdb');
const cors = require('cors');
const FileSync = require('lowdb/adapters/FileSync');
const parser = require('./parser/parser');
const express = require('express');


const app = express();
app.use(cors());

const port = 4000;

const adapter = new FileSync('DB.json');
global.DB = low(adapter);


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/start-parser', async (req, res) => {
    await parser.start();
    res.send('Parser ready');
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})