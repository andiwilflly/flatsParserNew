import mapboxgl from 'mapbox-gl';
// MobX
import { makeAutoObservable } from 'mobx';
// Helpers
import createDot from "../map/mapDot.canvas";
import L from "leaflet";


class MapModel {

    map = null;
    popup = null;
    dotSize = 20;

    constructor() {
        makeAutoObservable(this);
    }


    setup() {
        this.map =  L.map('map').setView([50.4501, 30.5234], 11);

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: '',
            minZoom: 11,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1
        }).addTo(this.map);
    }


    drawFeatures(features = []) {
        this.map.on('load', ()=> {
            this.map.addImage('pulsing-dot', createDot(this.map), { pixelRatio: 2 });

            this.map.addSource('points', {
                type: 'geojson',
                'data': {
                    type: 'FeatureCollection',
                    features
                }
            });

            this.map.addLayer({
                id: 'symbols',
                type: 'symbol',
                source: 'points',
                layout: {
                    'icon-image': 'pulsing-dot'
                }
            });
        });
    }


    drawPopup(feature) {
        console.log('feature', feature);
        this.popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`
                <a href=${feature.properties.link} target="_blank">
                    <img src=${feature.properties.img} style="width: 100%; height: auto;">
                    <br/>
                    <b>${feature.properties.title}</b>    
                    <p>${feature.properties.price}</p>    
                </a>
            `)
            .addTo(this.map);
    }
}

export default new MapModel();
