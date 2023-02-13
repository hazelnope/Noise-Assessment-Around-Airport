import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import axios from 'axios';


function Select_flights(props) {
    const filterFlights = props.filterFlights
    const [value, setValue] = useState([]);
    // const [isLoading, setLoading] = useState(props.isLoading);

    const handleChange = (val) => {
        // console.log(val)
        setValue(val)
    };

    const flights = filterFlights.map((flight) =>
        <ToggleButton id={`tbg-btn-${flight}`} value={flight}>
            {flight}
        </ToggleButton>
    );

    useEffect(() => {
        // setLoading(props.isLoading)
        // console.log("Loading... =>", isLoading, filterFlights, props.filterFlights.length === 0)
        // if (isLoading) {
        //     // setLoading(false);

        // }
    }, );

    const handleClick = () => {
        // setLoading(true)
        props.handleSelectFlights(value)
        // setLoading(false);

    };

    return (
        <div className='block'>
            <ToggleButtonGroup type="checkbox" value={value} onChange={handleChange} vertical={true}>
                {flights}
            </ToggleButtonGroup >

            {props.filterFlights.length !== 0? <Button
                variant="primary"
                // disabled={isLoading}
                // onClick={!isLoading ? handleClick : null}
                onClick={handleClick}
            >
                Click to load data
                {/* {isLoading ? 'Loading…' : 'Click to load data'} */}
            </Button>:null}
             {/* <Button
                 variant="primary"
                 disabled={isLoading}
                 onClick={!isLoading ? handleClick : null}
             >
                 {isLoading ? 'Loading…' : 'Click to load data'}
             </Button> */}
        </div>
    );
}

export default Select_flights;