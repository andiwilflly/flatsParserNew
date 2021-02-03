import React from "react"
import mapboxgl from 'mapbox-gl';
import L from 'leaflet';
import 'leaflet.markercluster';
import LG from "leaflet-geometryutil";
import DB from "../server/DB.json";
import "../map/canvasIcon";
import canvasMarker from "../map/canvasMarker";
// Models
import mapModel from "../models/map.model";


const TOKEN = 'pk.eyJ1IjoiYW5kaXdpbGxmbHkiLCJhIjoiY2s2cW1qajhoMHB3MDNzcW81dmM4bDlkMSJ9.gmA_WZGL_NxHa4hdx9sttA'

class Map extends React.Component {

    map = null;
    popup = null;


    componentDidMount() {
        mapboxgl.accessToken = TOKEN;
        mapModel.setup();

        const myIcon = L.canvasIcon({drawIcon: canvasMarker});

        //const markers = L.markerClusterGroup();

        let markers = [];
        DB.offers.forEach(offer => {
            const marker = L.marker([
                offer.geo.displayPosition.latitude,
                offer.geo.displayPosition.longitude
            ], {icon: myIcon, ...offer})
                .addTo(mapModel.map)
                .on('click', (e) => {
                    console.log('clisds!');
                    const offer = e.sourceTarget.options;
                    mapModel.drawPopup(L, e.latlng, offer);
                });
            markers.push(marker);
           // markers.addLayer(marker);
        });

        //mapModel.map.addLayer(markers);

        // markers.on('click', function (e) {
        //     console.log('marker ', e);
        //     const offer = e.sourceTarget.options;
        //     mapModel.drawPopup(L, e.latlng, offer);
        // });

        mapModel.map.on('click', function (e) {
            console.log('3', markers, L.GeometryUtil.closest(mapModel.map, markers, e.latlng));

            // for (var i = 0; i < markers.length; i++) {
            //     if (e.boxZoomBounds.contains(markers[i])) {
            //         console.log(markers[i]);
            //     }
            // }
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

export default Map;
