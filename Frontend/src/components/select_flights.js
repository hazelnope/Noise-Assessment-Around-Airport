import React, { Component, useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import "./select_flights.css"


function Select_flights(props) {
    const filterFlights = props.filterFlights
    const [value, setValue] = useState([]);
    const [userLat, setUserLat] = useState();
    const [userLong, setUserLong] = useState();

    const handleChange = (val) => {
        // console.log(val)
        setValue(val)
    };

    const handleLatitudeChange = (e) => {
        setUserLat(e.target.value);
        // console.log('userLat:',userLat);
    }

    const handleLongitudeChange = (e) => {
        setUserLong(e.target.value);
        // console.log('userLong:',userLong);
    }

    const clickToSend = () => {
        // console.log('userLat2',userLat)
        if (userLat === undefined || userLong === undefined || userLat === '' || userLong === '') {
            props.handleLatitudeChange(0);
            props.handleLongitudeChange(0);
        }
        else {
            props.handleLatitudeChange(userLat);
            props.handleLongitudeChange(userLong);
        }
        // console.log('do');
    }


    const SecToDate = (sec) => {
        var dateFormat = new Date(1970, 0, 1);
        dateFormat.setSeconds(sec+25200);
        // dateFormat.setSeconds(sec);
        // console.log('sec date',dateFormat)
    
        // dateFormat = `${dateFormat.getFullYear()}/${dateFormat.getMonth() + 1}/${dateFormat.getDate()}`
        dateFormat = `${dateFormat.getDate()}/${dateFormat.getMonth() + 1}/${dateFormat.getFullYear()}`
        return dateFormat;
      }

    const flights = filterFlights.map((flight) =>
                <ToggleButton variant={flight['available_grid']===true? 'success':'warning'} class="test_color" id={`tbg-btn-${flight["id"]}`} value={flight["id"]}>

            {flight['id'].split("-")[0] + " - " + SecToDate(flight['date']) + " - " + flight['D_or_A']}
        </ToggleButton>
    );

    const handleClick = () => {
        props.handleSelectFlights(value)
    };



    return (
        <div class="PinAndFlights">
            <div class="LeftAndRight">
                {props.filterFlights.length !== 0? <div class="textSelectFlights">
                    <h3>Select Flights</h3>
                </div>:null}

                <ToggleButtonGroup class={flights.length >= 6 ?'Flight2':'Flight1'} value={value} onChange={handleChange} type="checkbox" vertical={true}>
                    {flights}
                </ToggleButtonGroup >

                {props.filterFlights.length !== 0? <button
                    class="LoadDataButton"
                    variant="primary"
                    onClick={handleClick}
                >
                    Click to Load Model
                </button>:null}
            </div>

            {props.showLatLong ? <div class="LeftAndRight">
                <Form.Group class="InLatLong" controlId="formBasicLatitude">
                    <Form.Label class="InLat">Latitude</Form.Label>
                    <input class="InLat" type="text" placeholder="Enter Latitude" value={userLat} onChange={handleLatitudeChange}/>
                </Form.Group>

                <Form.Group class="InLatLong" controlId="formBasicLongitude">
                    <Form.Label class="InLong">Longitude</Form.Label>
                    <input class="InLong" type="text" placeholder="Enter Longitude" value={userLong} onChange={handleLongitudeChange}/>
                </Form.Group>

                <button class="SearchButton" variant="primary" type="submit" onClick={clickToSend}>
                    Search
                </button>
            </div>:null}

            {}
        </div>
    );
}

export default Select_flights;