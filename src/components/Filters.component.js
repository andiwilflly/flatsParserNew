import React from "react";
import { observer } from "mobx-react";
import { observable } from "mobx";


class Filters extends React.Component {

    form = observable({
        isLoadingOffers: false
    });


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
                       onChange={ (e)=> console.log(e.target.value) } />
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
