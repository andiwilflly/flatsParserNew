import lowdb from "lowdb";
import Fuse from "fuse.js";
import LowdbAdapter from "lowdb/adapters/LocalStorage";
// MobX
import { makeAutoObservable, action } from 'mobx';
import DB from "../server/DB.json";
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


class MapModel {

    newMs = 86400000;
    map = null;
    layer = null;
    popup = null;
    worker = null;
    dotSize = 20;
    filters = {
        isShowOnlyNew: true,
        query: ''
    };

    filteredOffers = DB.offers;
    hoveredOffers = {
        list: [],
        top: 0,
        left: 0
    };
    selectedOffers = [];


    fuse = new Fuse(DB.offers, {
        shouldSort: true,
        includeScore: true,
        includeMatches: true,
        threshold: 0.2,
        location: 0,
        distance: 200,
        maxPatternLength: 200,
        minMatchCharLength: 3,
        keys: ["title", 'address', 'source', 'square', 'description']
    });


    constructor() {
        makeAutoObservable(this);

        const adapter = new LowdbAdapter();
        window.db = lowdb(adapter);
        if(!window.db.get('visitedOffers').value()) window.db.defaults({ visitedOffers: [] }).write();

    }


    update = action((newFields = {})=> {
        Object.keys(this).forEach((fieldName)=> {
            if(newFields[fieldName] !== undefined) this[fieldName] = newFields[fieldName];
        });
    })


    setup() {
        const offersDB = window.db.get('visitedOffers');

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

            features.forEach(feature => {
                const isVisited = !!offersDB.find({ id: feature.values_.id }).value();
                if(!isVisited) offersDB.push({ id: feature.values_.id }).write();
                this.updateDot(feature);
            });

            this.update({
                hoveredOffers: {
                    list: [],
                    left: 0,
                    top: 0
                },
                selectedOffers: features
            });
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


    redraw() {
        setTimeout(()=> {
            // Query filters
            let filteredOffers = this.filters.query.length <= 2 ?
                DB.offers
                :
                this.fuse.search(this.filters.query).map(offer => offer.item);

            // Old/new filters
            if(this.filters.isShowOnlyNew) filteredOffers = filteredOffers.filter(offer => Date.now() - offer.createdAt < this.newMs);

            this.update({ filteredOffers });
            this.vectorLayer.getSource().clear();
            this.vectorLayer.getSource().addFeatures(this.filteredOffers.map((offer)=> this.createDot(offer)));
        }, 15);
    }


    updateDot(feature) {
        feature.setStyle(new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                    color: 'gray'
                }),
                stroke: new Stroke({ color: 'white', width: 1 })
            })
        }));
    }


    createDot = (offer)=> {
        const flatDot = new Feature({
            ...offer,
            geometry: new Point(fromLonLat([offer.geo.displayPosition.longitude, offer.geo.displayPosition.latitude]))
        });

        const isVisited = window.db.get('visitedOffers').find({ id: offer.id }).value();

        // 86400000
        flatDot.setStyle(new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({
                    color: isVisited ?
                        'gray'
                        :
                        (Date.now() - offer.createdAt > this.newMs ? 'blue' : 'red')
                }),
                stroke: new Stroke({ color: 'white', width: 1 })
            })
        }));

        return flatDot;
    }
}

export default new MapModel();
