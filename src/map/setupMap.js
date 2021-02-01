import React from "react"
import mapboxgl from 'mapbox-gl';


export default function () {
    const TOKEN = 'pk.eyJ1IjoiYW5kaXdpbGxmbHkiLCJhIjoiY2s2cW1qajhoMHB3MDNzcW81dmM4bDlkMSJ9.gmA_WZGL_NxHa4hdx9sttA'


            mapboxgl.accessToken = TOKEN;
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
                center: [-74.5, 40], // starting position [lng, lat]
                zoom: 9 // starting zoom
            });

            this.map.on('load', ()=> {
                this.map.addImage('pulsing-dot', createDot(this.map), { pixelRatio: 2 });

                this.map.addSource('points', {
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
                this.map.addLayer({
                    'id': 'symbols',
                    'type': 'symbol',
                    'source': 'points',
                    'layout': {
                        'icon-image': 'pulsing-dot'
                    }
                });
            });

            this.map.on('click', 'symbols', (e)=> {
                const feature = e.features[0];

                this.popup && this.popup.remove();
                this.popup = new mapboxgl.Popup({ closeOnClick: false })
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(`<div>TEST</div>`)
                    .addTo(this.map);

                // this.map.flyTo({
                //     center: e.features[0].geometry.coordinates
                // });
            });

            this.map.on('mouseenter', 'symbols', ()=> {
                this.map.getCanvas().style.cursor = 'pointer';
            });

            this.map.on('mouseleave', 'symbols', ()=> {
                this.map.getCanvas().style.cursor = '';
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

}