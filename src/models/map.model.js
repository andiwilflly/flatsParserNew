import mapboxgl from 'mapbox-gl';
// MobX
import { makeAutoObservable } from 'mobx';
// Helpers
import createDot from "../map/mapDot.canvas";


class MapModel {

    map = null;
    popup = null;

    constructor() {
        makeAutoObservable(this);
    }


    setup(options = {}) {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [30.5234, 50.4501],
            zoom: 9,
            ...options
        })
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
        this.popup = new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`<div>TEST</div>`)
            .addTo(this.map);
    }
}

export default new MapModel();
