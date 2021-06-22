const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const cors = require('cors');
const parser = require('./parser/parser');
const express = require('express');


const app = express();
app.use(cors());

const port = 4000;

global.DB = new JsonDB(new Config("./src/server/DB", false, true, '/'));
try {
    global.DB.getData('/offers')
} catch {
    global.DB.push("/offers", []);
}


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/start-parser', async (req, res) => {
    const offersLength = await parser.start();
    res.send('Parser ready' + offersLength);
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
