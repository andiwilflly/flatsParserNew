import React from "react"


class Filters extends React.Component {

    render() {
        return (
            <div className='filters'>
                <input type="search"
                       placeholder='Поиск по контенту'
                       onChange={ (e)=> console.log(e.target.value) } />
            </div>
        );
    }
}

export default Filters;
