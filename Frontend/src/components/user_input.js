import React, { Component, useState }  from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function User_Input(props) {
    // const [userLat, setUserLat] = useState(13.9133);
    // const [userLong, setUserLong] = useState(100.6042);
    const [userLat, setUserLat] = useState();
    const [userLong, setUserLong] = useState();
    // lat = 13.9133
    // long = 100.6042

    const handleLatitudeChange = (e) => {
        setUserLat(e.target.value);
        // console.log('userLat:',userLat);
    }

    const handleLongitudeChange = (e) => {
        setUserLong(e.target.value);
        // console.log('userLong:',userLong);
    }

    const clickToSend = () => {
        props.handleLatitudeChange(userLat);
        props.handleLongitudeChange(userLong);
        // console.log('do');
    }

    return (
        <Form>
            <Form.Group className="mb-3" controlId="formBasicLatitude">
                <Form.Label>Latitude</Form.Label>
                <Form.Control type="text" placeholder="Enter Latitude" value={userLat} onChange={handleLatitudeChange}/>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicLongitude">
                <Form.Label>Longitude</Form.Label>
                <Form.Control type="text" placeholder="Enter Longitude" value={userLong} onChange={handleLongitudeChange}/>
            </Form.Group>

            <Button variant="primary" type="submit" onClick={clickToSend}>
                Search
            </Button>
        </Form>
    );
}

export default User_Input;