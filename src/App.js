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

        mapModel.map.on('load', ()=> {
            mapModel.map.addImage('pulsing-dot', createDot(mapModel.map), { pixelRatio: 2 });

            mapModel.map.addSource('points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'properties': {
                                some: 42
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-74.5, 40]
                            }
                        },
                        {
                            'type': 'Feature',
                            'properties': {
                                some: 12
                            },
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [-74.07, 40.05]
                            }
                        }
                    ]
                }
            });

            // Add a symbol layer
            mapModel.map.addLayer({
                'id': 'symbols',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'pulsing-dot'
                }
            });
        });

        mapModel.map.on('click', 'symbols', (e)=> {
            const feature = e.features[0];

            this.popup && this.popup.remove();
            this.popup = new mapboxgl.Popup({ closeOnClick: false })
                        .setLngLat(feature.geometry.coordinates)
                        .setHTML(`<div>TEST</div>`)
                        .addTo(mapModel.map);

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
