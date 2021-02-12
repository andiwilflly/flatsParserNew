import Fuse from 'fuse.js';
import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";
import DB from "../server/DB.json";
// Models
import mapModel from "../models/map.model";


class Filters extends React.Component {

    form = observable({
        isLoadingOffers: false,
        selectedTypes: []
    });


    fuse = new Fuse(DB.offers, {
        shouldSort: true,
        includeScore: true,
        includeMatches: true,
        threshold: 0.2,
        location: 0,
        distance: 200,
        maxPatternLength: 200,
        minMatchCharLength: 3,
        keys: ["title", 'address', 'source', 'square', 'description']
    });



    timeout = null;
    onSearch = (e)=> {
        clearTimeout(this.timeout);
        this.timeout = setTimeout((text)=> {
            if(text.length < 2) {
                mapModel.update({
                    filteredOffers: DB.offers
                });
                return this.setFeatures(DB.offers.map(offer => mapModel.createDot(offer)));
            }

            mapModel.update({
                filteredOffers: this.fuse.search(text).map(offer => offer.item)
            });
            this.setFeatures(mapModel.filteredOffers.map(offer => mapModel.createDot(offer)));
        }, 400, e.target.value);
    };


    setFeatures(features) {
        mapModel.vectorLayer.getSource().clear();
        mapModel.vectorLayer.getSource().addFeatures(features);
    }


    runParser = async ()=> {
        this.form.isLoadingOffers = true;
        try {
            let result = await fetch('http://localhost:4000/start-parser');
            this.form.isLoadingOffers = false;
            console.log(await result.text(), '??');
        } catch(e) {
            console.log(e, '??');
            this.form.isLoadingOffers = false;
        }
    }


    render() {
        return (
            <div className='filters'>
                <input type="search"
                       placeholder='Поиск по контенту'
                       onChange={ this.onSearch } />
                <br/>
                <i style={{ fontSize: 11 }}>всего найдено квартир: { mapModel.filteredOffers.length }</i>

                <br/>
                <br/>
                <button disabled={ this.form.isLoadingOffers }
                        onClick={ this.runParser }>
                    { this.form.isLoadingOffers ? 'Ищем варианты...' : 'Запустить парсер' }
                </button>
            </div>
        );
    }
}

export default observer(Filters);
