import React from "react";
import { observer } from 'mobx-react';
import mapModel from "../models/map.model";


const formatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' });


class Popup extends React.Component {

    renderOfferPopup = (offer, size)=> {
        offer = offer.values_;
        return (
            <div key={ offer.id } style={{ marginBottom: 10, padding: 3 }}>
                <a href={ offer.link }
                   target="_blank"
                   style={{ fontSize: 12 }}>{ offer.address }</a>
                <div>
                    <b style={{ color: '#ff6a16', fontSize: 12 }}>{ formatter.format(offer.price) }</b>
                </div>
                <div style={{
                    width: size,
                    display: 'flex',
                    flexWrap: 'wrap',
                    margin: '4px 0',
                    justifyContent: 'start'
                }}>
                    <img src={ offer.img }
                         style={{
                             maxWidth: size - 10,
                             objectFit: 'contain',
                             margin: 1,
                             maxHeight: size - 5
                         }} />
                </div>

                { offer.square ? <div style={{ fontSize: 10 }}><i>{offer.square} м²</i></div> : null }
                { offer.floor ? <div style={{ fontSize: 10 }}><i>этаж {offer.floor[0]} из {offer.floor[1]}</i></div> : null }
                <div style={{ fontSize: 10 }}><i>{ offer.description && offer.description.slice(0, 200) + '...' }</i></div>
                <div style={{ fontSize: 10 }}><i>{ offer.geo.address && offer.geo.address.label }</i></div>
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
                        maxWidth: Math.ceil(Math.sqrt(mapModel.hoveredOffers.list.length)) * 150,
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
                        { mapModel.hoveredOffers.list.map((offer)=> this.renderOfferPopup(offer,100)) }
                    </div>
                    :
                    null }

                { mapModel.selectedOffers.length ?
                    <div id="info" style={{
                        position: 'fixed',
                        bottom: 5,
                        lineHeight: '100%',
                        right: 5,
                        zIndex: 101,
                        overflow: 'auto',
                        maxHeight: '90vh',
                        width: 300,
                        boxShadow: '0px 0px 38px 10px rgba(143,143,143,1)',
                        display: 'gr id',
                        gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(mapModel.selectedOffers.length))}, 1fr)`,
                        gridTemplateRows: `repeat(${Math.ceil(Math.sqrt(mapModel.selectedOffers.length))}, 1fr)`,
                        gridColumnGap: 3,
                        gridRowGap: 3,
                        background: 'whitesmoke',
                        padding: 5
                    }}>
                        { mapModel.selectedOffers.map(flat => this.renderOfferPopup(flat, 295)) }
                    </div>
                    : null }
            </div>
        );
    }
}

export default observer(Popup);
