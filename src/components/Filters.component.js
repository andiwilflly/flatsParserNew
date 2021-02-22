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


    timeout = null;
    onSearch = (e)=> {
        clearTimeout(this.timeout);
        this.timeout = setTimeout((text)=> {
            mapModel.update({
                filters: {
                    ...mapModel.filters,
                    query: text
                }
            });
            mapModel.redraw();
        }, 400, e.target.value);
    };


    onNewClick = (isShowOnlyNew)=> {
        mapModel.update({
            filters: {
                ...mapModel.filters,
                isShowOnlyNew
            }
        });
        mapModel.redraw();
    };


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
                <label htmlFor="new">
                    Показывать только новые
                    <input type="checkbox"
                           className='checkbox'
                           id='new'
                           value={ mapModel.filters.isShowOnlyNew }
                           onClick={ (e)=> this.onNewClick(e.target.checked) } />
                </label>

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
