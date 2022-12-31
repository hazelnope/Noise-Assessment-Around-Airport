import React, { Component, useState }  from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';



function NavScrollExample(props) {

  const handleDateClick = (eventKey) => {
    props.handleDateChange(eventKey);
  };

  const handleTimeClick = (eventKey) => {
    props.handleTimeChange(eventKey);
  };

  const options = [];
  for (let i = 0; i < 8; i++) {
    options.push(`${i < 4 ? '0' : ''}${i * 3}:00 - ${i < 3 ? '0' : ''}${i * 3 + 2}:59`);
  }

  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <button onClick={handleDateClick}>
          Update date
          </button>
        <Navbar.Brand href="#">Noise Assessment Around Airport</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="justify-content-end" style={{ width: "100%" }}>
            <NavDropdown title="S E L E C T - D A T E " id="navbarScrollingDropdown" onSelect={handleDateClick} >
              <NavDropdown.Item href="#action1" eventKey="10/12/2022">10/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action2" eventKey="15/12/2022">15/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action3" eventKey="20/12/2022">20/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action4" eventKey="25/12/2022">25/12/2022</NavDropdown.Item>
            </NavDropdown>
            
            <NavDropdown title="S E L E C T - T I M E "  onSelect={handleTimeClick} id="navbarScrollingDropdown">
              {options.map((option) => (
                <NavDropdown.Item eventKey={option} key={option}>
                  {option}
                </NavDropdown.Item>
              ))}
            </NavDropdown>


          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;