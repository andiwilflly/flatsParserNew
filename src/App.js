import React from "react"
import 'leaflet/dist/leaflet.css';
// Components
import Map from "./components/Map.cmponent";
import Filters from "./components/Filters.component";
import Popup from "./components/Popup.component";


class App extends React.Component {

    render() {
        return (
            <>
                <Map />
                <Filters />
                <Popup />
            </>
        );
    }
}

export default App;
