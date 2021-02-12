// MobX
import { makeAutoObservable, action } from 'mobx';
import DB from "../server/DB.json";
// Helpers
// Map Ol
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
// Other
import * as ComLink from "comlink";


class MapModel {

    map = null;
    layer = null;
    popup = null;
    worker = null;
    dotSize = 20;
    filteredOffers = DB.offers;
    hoveredOffers = {
        list: [],
        top: 0,
        left: 0
    };
    selectedOffers = [];

    constructor() {
        makeAutoObservable(this);
        //this.setupWorker();
    }


    update = action((newFields = {})=> {
        Object.keys(this).forEach((fieldName)=> {
            if(newFields[fieldName] !== undefined) this[fieldName] = newFields[fieldName];
        });
    })


    async setupWorker() {
        this.worker = new Worker( '../map/searchWorker.js');
        const obj = ComLink.wrap(this.worker);
        console.log(`Counter: ${await obj.counter}`);
        await obj.inc();
        console.log(`Counter: ${await obj.counter}`);
    }


    setup() {
        const vectorSource = new VectorSource({
            features: DB.offers.map((offer)=> this.createDot(offer))
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

            // this.vectorLayer.getSource().clear();
            // this.vectorLayer.getSource().addFeatures(this.filteredOffers.map(offer => {
            //     this.createDot(offer, !!features.find(f => f.values_.id === offer.id) ? 'gray': null);
            // }));

            console.log(features, 2);
            this.update({
                hoveredOffers: {
                    list: [],
                    left: 0,
                    top: 0
                },
                selectedOffers: features
            });
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

            this.update({
                hoveredOffers: {
                    list: features,
                    left: pixel[0],
                    top: pixel[1] + 25
                }
            });
            this.map.getViewport().style.cursor = features.length ? 'pointer' : 'inherit';
        });
    }


    createDot = (offer, color)=> {
        const flatDot = new Feature({
            ...offer,
            geometry: new Point(fromLonLat([offer.geo.displayPosition.longitude, offer.geo.displayPosition.latitude]))
        });

        flatDot.setStyle(new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                    color: color || (Date.now() - offer.createdAt > 86400000 ? 'blue' : 'red')
                }),
                stroke: new Stroke({ color: 'white', width: 1 })
            })
        }));

        return flatDot;
    }
}

export default new MapModel();
