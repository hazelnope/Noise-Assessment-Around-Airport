import React, { Component, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';
import { url } from './config';
import DatePicker from "react-datepicker";
import { Link  } from 'react-router-dom';
import "./navbar.css"


function NavScrollExample(props) {
  const [startDate, setStartDate] = useState(0)
  const [selectdate, setSelectdate] = useState('')
  const [selecttime, setSelectTime] = useState('')
  const [checkDate, setCheckDate] = useState(0)
  const [checkTime, setCheckTime] = useState(0)


  var temp_flight = []

  const handleStartDate = (date) => {
    setSelectdate(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
    setStartDate(date)
  }

  const handleDateClick = (eventKey) => {
    // props.handleDateChange(eventKey);
    console.log('key select date', eventKey)
    setCheckDate(1);
    setSelectdate(eventKey);
  };

  const handleTimeClick = (eventKey) => {
    setCheckTime(eventKey);
    eventKey = eventKey.split(' ')[0]
    eventKey = eventKey + ':00'
    // console.log('key aftedr split', eventKey)
    setSelectTime(eventKey);

    if (eventKey === '21:00:00') {
      props.handleDurationDay(2)
      props.handleDurationNight(1)
    }
    else if (eventKey === '00:00:00' || eventKey === '03:00:00') {
      props.handleDurationDay(0)
      props.handleDurationNight(3)
    }
    else if (eventKey === '06:00:00') {
      props.handleDurationDay(2)
      props.handleDurationNight(1)
    }
    else {
      props.handleDurationDay(3)
      props.handleDurationNight(0)
    }

  };

  const handleSearch = async (flight_dict) => {
    temp_flight = []
    // console.log('flight1',flight_dict)
    await flight_dict.forEach(function (item) {
      // console.log('loop',item)
      temp_flight.push(item)
    })
    props.handleFilterFlights(temp_flight)
    // console.log('flight2',temp_flight)
  }

  const search = () => {
    // console.log('search', `${selectdate} ${selecttime}`);

    axios.post(url + 'filter_flight', {
      // 2022-12-13 06:00:00
      'date': `${selectdate} ${selecttime}`
    }).then((response) => {
      // console.log('get flights ', response.data.res)
      handleSearch(response.data.res)
    })
  }

  const options = [];
  for (let i = 0; i < 8; i++) {
    options.push(`${i < 4 ? '0' : ''}${i * 3}:00 - ${i < 3 ? '0' : ''}${i * 3 + 2}:59`);
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand href="#">Noise Assessment Visualization</Navbar.Brand>
        {/* <Link to="/InsertData"><button class="LikeToInsertData" >Insert more data</button></Link> */}
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="justify-content-end" style={{ width: "100%" }}>


            <div class='SelectDate'>
              <DatePicker
                placeholderText={'S E L E C T - D A T E'}
                selected={startDate}
                dateFormat= 'dd/MM/yyyy'
                // onChange={(date) => props.handleStartDate(date)}
                onChange={(date) => handleStartDate(date)}
              />
            </div>


            <NavDropdown title={checkTime ? selecttime : "S E L E C T - T I M E "} onSelect={handleTimeClick} id="navbarScrollingDropdown">
              {options.map((option) => (
                <NavDropdown.Item eventKey={option} key={option}>
                  {option}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            {/* <button class="btn btn-outline-success" type="button" onClick={search}>Search</button> */}
            <button class="NavSearchButton" type="button" onClick={search}>Search</button>
            <Link to="/InsertData"><button class="LikeToInsertData" >Insert More Data</button></Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;