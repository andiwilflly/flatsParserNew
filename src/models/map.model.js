// MobX
import { makeAutoObservable } from 'mobx';
import DB from "../server/DB.json";
// Helpers
// Map Ol
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Icon, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
// Other
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


    setup2() {
        const vectorSource = new VectorSource({
            features: DB.offers.map(offer => {
                const flatDot = new Feature({
                    ...offer,
                    geometry: new Point(fromLonLat([offer.geo.displayPosition.longitude, offer.geo.displayPosition.latitude]))
                });

                flatDot.setStyle(new Style({
                    image: new CircleStyle({
                        radius: 4,
                        fill: new Fill({
                            color: 'blue'
                        }),
                        stroke: new Stroke({ color: 'white', width: 1 })
                    })
                }));

                return flatDot;
            })
        });

        this.vectorLayer = new VectorLayer({
            source: vectorSource
        });

        const tileLayer = new TileLayer({
            source: new OSM()
        });

        this.map = new Map({
            layers: [tileLayer, this.vectorLayer],
            target: document.getElementById('map'),
            view: new View({
                center: fromLonLat([30.5234, 50.4501]),
                zoom: 11
            })
        });

        this.map.set('layers', []);
        this.map.render();

        this.map.on('click', (event)=> {
            const features = this.map.getFeaturesAtPixel(event.pixel);

            console.log(features, 2);
            //this.hoveredFlatsData.ids = [];
            // features.forEach(feature => {
            //     this.flats[feature.values_.link].flat.isVisited = true;
            // });
            // this.onSearch({ target: { value: document.querySelector('input').value }});
            //this.clickedFlats.ids = features.map(feature => feature.values_.link);
        });

        this.map.on('pointermove', (event)=> {
            //if(event.dragging) return this.hoveredFlatsData.ids = [];

            const pixel = this.map.getEventPixel(event.originalEvent);
            const features = this.map.getFeaturesAtPixel(pixel);

            // this.hoveredFlatsData.ids = features.map(feature => feature.values_.link);
            // this.hoveredFlatsData.left = pixel[0];
            // this.hoveredFlatsData.top = pixel[1] + 25;
            this.map.getViewport().style.cursor = features.length ? 'pointer' : 'inherit';
        });
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
