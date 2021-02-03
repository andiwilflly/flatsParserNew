import React from "react";
import { observer } from 'mobx-react';
import mapModel from "../models/map.model";


const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' });


class Popup extends React.Component {

    renderOfferPopup = (offer)=> {
        offer = offer.values_;
        return (
            <div key={ offer.id }>
                <a href={ offer.link }
                   target="_blank"
                   style={{ fontSize: 12 }}>{ offer.address }</a>
                <br/>
                <b style={{ color: '#ff6a16', fontSize: 12 }}>{ formatter.format(offer.price) }</b>
                <div style={{
                    width: 100,
                    display: 'flex',
                    flexWrap: 'wrap',
                    height: 100,
                    margin: '4px 0',
                    justifyContent: 'start'
                }}>
                    <img src={ offer.img }
                         style={{
                             maxWidth: 100 - 10,
                             objectFit: 'contain',
                             margin: 1,
                             maxHeight: 100 - 5
                         }} />
                </div>


                <div style={{ fontSize: 10 }}><i>{ offer.geo.address.label }</i></div>
                <div style={{ fontSize: 10, color: offer.color }}><i>({ offer.source })</i></div>
            </div>
        );
    }


    render() {
        return (
            <div className='popup'>

                { mapModel.hoveredOffers.list.length ?
                    <div id="smallPopup" style={{
                        position: 'fixed',
                        background: 'white',
                        lineHeight: '100%',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(mapModel.hoveredOffers.list.length))}, 1fr)`,
                        gridTemplateRows: `repeat(${Math.round(Math.sqrt(mapModel.hoveredOffers.list.length))}, 1fr)`,
                        gridColumnGap: 3,
                        gridRowGap: 3,
                        top: mapModel.hoveredOffers.top,
                        boxShadow: '0px 0px 38px 10px rgba(143,143,143,1)',
                        left: mapModel.hoveredOffers.left,
                        zIndex: 100
                    }}>
                        { mapModel.hoveredOffers.list.map(this.renderOfferPopup) }
                    </div>
                    :
                    null }

                Popup
            </div>
        );
    }
}

export default observer(Popup);
