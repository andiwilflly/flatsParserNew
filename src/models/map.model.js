import mapboxgl from 'mapbox-gl';
// MobX
import { makeAutoObservable } from 'mobx';


class MapModel {

    map = null;

    constructor() {
        makeAutoObservable(this);
    }


    setup(options = {}) {
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-74.5, 40],
            zoom: 9,
            ...options
        })
    }
}

export default new MapModel();
