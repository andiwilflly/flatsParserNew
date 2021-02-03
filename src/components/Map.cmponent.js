import React from "react"
import 'leaflet.markercluster';
import "../map/canvasIcon";
// Models
import mapModel from "../models/map.model";

class Map extends React.Component {

    map = null;
    popup = null;


    componentDidMount() {
        mapModel.setup2();
    }


    render() {
        return (
            <>
                <div id='map' style={{ width: '100vw', height: '100vh' }} />
            </>
        );
    }
}

export default Map;
