// MobX
import { makeAutoObservable } from 'mobx';
// Helpers
import L from "leaflet";
import * as ComLink from "comlink";

const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' });

class MapModel {

    map = null;
    layer = null;
    popup = null;
    worker = null;
    dotSize = 20;

    constructor() {
        makeAutoObservable(this);
        this.setupWorker();
    }

    async setupWorker() {
        this.worker = new Worker( '../map/searchWorker.js');
        const obj = ComLink.wrap(this.worker);
        console.log(`Counter: ${await obj.counter}`);
        await obj.inc();
        console.log(`Counter: ${await obj.counter}`);
    }


    setup() {
        this.map =  L.map('map').setView([50.4501, 30.5234], 12);

        // https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
        this.layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '',
            minZoom: 11,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(this.map);
    }


    drawPopup(L, latLng, offer) {
        L.popup()
            .setLatLng(latLng)
            .setContent(`
                <a href=${offer.link} target="_blank">
                    <img src=${offer.img} style="min-width: 200px; width: 100%; height: auto;">
                   
                    <b>${offer.title}</b>
                    <div style="color: black">${formatter.format(offer.price)}</div>  
                    <br/>  
                    <div>площадь: ${offer.square}м</div>  
                    <div>этаж: ${offer.floor[0]}/${offer.floor[1]}</div>  
                    <div>${offer.address}</div>    
                    (<i style="color:gray">${offer.geo.address.label}</i>)              
                    <hr/>
                    <div style="color: gray">${offer.source}</div>
                </a>
            `)
            .openOn(this.map);
    }
}

export default new MapModel();
