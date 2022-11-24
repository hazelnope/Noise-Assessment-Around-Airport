import React, { Component }  from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function NavScrollExample() {
  return (
    <Navbar bg="light" expand="lg">
      <Container fluid>
        <Navbar.Brand href="#">Noise Assessment Around Airport</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="justify-content-end" style={{ width: "100%" }}>
            <NavDropdown title="Time of day" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action1">00:00-06:00</NavDropdown.Item>
              <NavDropdown.Item href="#action2">06:00-12:00</NavDropdown.Item>
              <NavDropdown.Item href="#action3">12:00-18:00</NavDropdown.Item>
              <NavDropdown.Item href="#action4">18:00-00:00</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="Select flight path" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">AAA000</NavDropdown.Item>
              <NavDropdown.Item href="#action4">BBB111</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;