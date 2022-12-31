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
            <NavDropdown title="S E L E C T - D A T E " id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action1">10/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action2">15/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action3">20/12/2022</NavDropdown.Item>
              <NavDropdown.Item href="#action4">25/12/2022</NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title="S E L E C T - T I M E " id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action1">00:00 - 02:59</NavDropdown.Item>
              <NavDropdown.Item href="#action2">03:00 - 05:59</NavDropdown.Item>
              <NavDropdown.Item href="#action3">06:00 - 08:59</NavDropdown.Item>
              <NavDropdown.Item href="#action4">09:00 - 11:59</NavDropdown.Item>
              <NavDropdown.Item href="#action5">12:00 - 14:59</NavDropdown.Item>
              <NavDropdown.Item href="#action6">15:00 - 17:59</NavDropdown.Item>
              <NavDropdown.Item href="#action7">18:00 - 20:59</NavDropdown.Item>
              <NavDropdown.Item href="#action8">21:00 - 23:59</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavScrollExample;