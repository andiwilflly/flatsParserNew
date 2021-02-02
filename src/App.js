import React from "react"
import mapboxgl from 'mapbox-gl';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DB from "./server/DB.json";
import "./map/canvasIcon";
import canvasMarker from "./map/canvasMarker";
// Models
import mapModel from "./models/map.model";


const TOKEN = 'pk.eyJ1IjoiYW5kaXdpbGxmbHkiLCJhIjoiY2s2cW1qajhoMHB3MDNzcW81dmM4bDlkMSJ9.gmA_WZGL_NxHa4hdx9sttA'

class App extends React.Component {

    map = null;
    popup = null;


    componentDidMount() {
        mapboxgl.accessToken = TOKEN;
        mapModel.setup();

        const myIcon = L.canvasIcon({ drawIcon: canvasMarker });
        const customCircleMarker = L.CircleMarker.extend({
            options: {
                someCustomProperty: 'Custom data!',
                anotherCustomProperty: 'More data!'
            }
        });


        DB.offers.forEach(offer => {
            L.marker([
                offer.geo.displayPosition.latitude,
                offer.geo.displayPosition.longitude
            ], { icon: myIcon, ...offer })
                .addTo(mapModel.map)
                .on('click', (e)=> {
                    const offer = e.sourceTarget.options;
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
                            <a href=${offer.link} target="_blank">
                                <img src=${offer.img} style="width: 100%; height: auto;">
                                <br/>
                                <b>${offer.title}</b>    
                                <div>${offer.price}</div>    
                            </a>
                        `)
                        .openOn(mapModel.map);
                });
        });
    }


    render() {
        return (
            <>
                <div id='map' style={{ width: '100vw', height: '90vh' }} />
            </>
        );
    }
}

export default App;
