import React from "react"
import mapboxgl from 'mapbox-gl';
// Components
import createDot from "./map/mapDot.canvas";
// Models
import mapModel from "./models/map.model";


const TOKEN = 'pk.eyJ1IjoiYW5kaXdpbGxmbHkiLCJhIjoiY2s2cW1qajhoMHB3MDNzcW81dmM4bDlkMSJ9.gmA_WZGL_NxHa4hdx9sttA'

class App extends React.Component {

    map = null;
    popup = null;


    componentDidMount() {
        mapboxgl.accessToken = TOKEN;
        mapModel.setup();

        mapModel.drawFeatures([
            {
                'type': 'Feature',
                'properties': {
                    some: 42
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [30.5234, 50.4501]
                }
            }
        ]);

        mapModel.map.on('click', (e)=> {
            mapModel.popup && mapModel.popup.remove();

            const features = mapModel.map.queryRenderedFeatures(e.point, { layers: ['symbols'] });
            if (!features.length) return;

            mapModel.drawPopup(features[0]);

            // mapModel.map.flyTo({
            //     center: e.features[0].geometry.coordinates
            // });
        });

        mapModel.map.on('mouseenter', 'symbols', ()=> {
            mapModel.map.getCanvas().style.cursor = 'pointer';
        });

        mapModel.map.on('mouseleave', 'symbols', ()=> {
            mapModel.map.getCanvas().style.cursor = '';
        });
    }


    render() {
        return (
            <>
                <div id='map' style={{ width: '100vw', height: '80vh' }} />
            </>
        );
    }
}

export default App;
