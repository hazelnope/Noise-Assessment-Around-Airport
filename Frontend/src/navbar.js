import React, { Component, useState }  from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';
import { url } from './config';


function NavScrollExample(props) {
  const [selectdate, setSelectdate] = useState('')
  const [selecttime, setSelectTime] = useState('')
  const [checkDate, setCheckDate] = useState(0)
  const [checkTime, setCheckTime] = useState(0)


  var temp_flight = []

  const handleDateClick = (eventKey) => {
    // props.handleDateChange(eventKey);
    console.log('key select date', eventKey)
    setCheckDate(1);
    setSelectdate(eventKey);
  };

  const handleTimeClick = (eventKey) => {
    setCheckTime(eventKey);
    eventKey = eventKey.split(' ')[0]
    eventKey = eventKey+':00'
    // console.log('key aftedr split', eventKey)
    // props.handleTimeChange(eventKey);
    setSelectTime(eventKey);

    if ( eventKey === '21:00:00' ) {
      props.handleDurationDay(2)
      props.handleDurationNight(1)
    }
    else if ( eventKey === '00:00:00' || eventKey === '03:00:00') {
      props.handleDurationDay(0)
      props.handleDurationNight(3)
    }
    else if ( eventKey === '06:00:00' ) {
      props.handleDurationDay(2)
      props.handleDurationNight(1)
    }
    else {
      props.handleDurationDay(3)
      props.handleDurationNight(0)
    }

  };

  const handleSearch = async (flight_dict)=>{
    temp_flight = []
    // console.log('เป็นรัย1',flight_dict)
    await flight_dict.forEach( function (item){
      // console.log('loop',item)
      temp_flight.push(item.id)
    } )
    props.handleFilterFlights(temp_flight)
    // console.log('เป็นรัย2',temp_flight)
  }

  const search = () => {
    console.log('search',`${selectdate} ${selecttime}`);
    
    axios.post(url+'filter_flight',{
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
        {/* <button onClick={handleDateClick}>
          Update date
          </button> */}
        <Navbar.Brand href="#">Noise Assessment Around Airport</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="justify-content-end" style={{ width: "100%" }}>
            {/* <NavDropdown title="S E L E C T - D A T E " id="navbarScrollingDropdown"  > */}
            {/* <NavDropdown title="S E L E C T - D A T E " id="navbarScrollingDropdown" onSelect={handleDateClick} > */}
            <NavDropdown title = {checkDate ? selectdate : "S E L E C T - D A T E " } id="navbarScrollingDropdown" onSelect={handleDateClick} >
              <NavDropdown.Item href="#action1" eventKey="2022-12-10">2022-12-10</NavDropdown.Item>
              <NavDropdown.Item href="#action2" eventKey="2022-12-15">2022-12-15</NavDropdown.Item>
              <NavDropdown.Item href="#action3" eventKey="2022-12-20">2022-12-20</NavDropdown.Item>
              <NavDropdown.Item href="#action4" eventKey="2022-12-25">2022-12-25</NavDropdown.Item>
              <NavDropdown.Item href="#action4" eventKey="2022-12-13">2022-12-13</NavDropdown.Item>
              <NavDropdown.Item href="#action4" eventKey="2023-01-12">2023-01-12</NavDropdown.Item>
            </NavDropdown>
            
            {/* <NavDropdown title="S E L E C T - T I M E "  onSelect={handleTimeClick} id="navbarScrollingDropdown"> */}
            {/* <NavDropdown title="S E L E C T - T I M E "   id="navbarScrollingDropdown"> */}
            <NavDropdown title = {checkTime ? selecttime : "S E L E C T - T I M E " }  onSelect={handleTimeClick} id="navbarScrollingDropdown">
              {options.map((option) => (
                <NavDropdown.Item eventKey={option} key={option}>
                  {option}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
            
            <button class="btn btn-outline-success" type="button" onClick={search}>Search</button>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;