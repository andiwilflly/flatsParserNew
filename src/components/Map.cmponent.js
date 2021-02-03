import React from "react"
// Models
import mapModel from "../models/map.model";

class Map extends React.Component {

    map = null;
    popup = null;


    componentDidMount() {
        mapModel.setup();
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
