import * as ComLink from "comlink";
const Fuse = require('fuse.js');

const obj = {
    counter: 0,
    inc() {
        this.counter++;
    },
};

ComLink.expose(obj);