import './App.css';
import React, { Component, useState } from 'react';
import 'mapbox-echarts'
import Navbar from './navbar'
import Map from './components/map';
import Select_flights from './components/select_flights';
import My_map from './components/map';
import API_to_DB from './components/api_to_db';
import User_Input from './components/user_input'
import ExportToCSV from './components/export_to_csv'
import { BrowserRouter, Route, Routes, Link  } from 'react-router-dom';



import "react-datepicker/dist/react-datepicker.css";


function App() {
  const [filterFlights, setFilterFlights] = useState([])
  const [selectFlights, setSelectFlights] = useState([])
  // const [isLoading, setLoading] = useState(false);
  const [durationDay, setDurationDay] = useState(0)
  const [durationNight, setDurationNight] = useState(0)
  const [startDate, setStartDate] = useState('2023-02-01');
  //----- user input -----//
  const [userLat, setUserLat] = useState(0);
  const [userLong, setUserLong] = useState(0);
  //----- can or can't select Lat,Long -----//
  const [showLatLong, setShowLatLong] = useState(0)
  //----- grid for export -----//
  const [gridForExport, setGridForExport] = useState([])



  //----- user input -----//
  const handleLatitudeChange = (newItem) => {
    setUserLat(newItem);
    // console.log('userLatAPP:',userLat);
  }

  //----- can or can't select Lat,Long -----//
  const handleShowLatLong = (newItem) => {
    setShowLatLong(newItem);
    // console.log('showLatLong:',showLatLong);
  }

  const handleGridForExport = (newItem) => {
    setGridForExport(newItem);
    // console.log('GridForExport',gridForExport);
  }

  const handleLongitudeChange = (newItem) => {
    setUserLong(newItem);
    // console.log('userLongAPP:',userLong);
  }

  const handleStartDate = (newItem) => {
    // console.log('newItem',newItem)
    // const date = newItem.getDate()
    // const month = newItem.getMonth()+1
    // const year = newItem.getFullYear()
    let tmp = `${newItem.getFullYear()}-${newItem.getMonth() + 1 < 10 ? '0' : ''}${newItem.getMonth() + 1}-${newItem.getDate() < 10 ? '0' : ''}${newItem.getDate()}`;
    // console.log("date:",date);
    // console.log("month:",month);
    // console.log("year:",year);
    // console.log("tmp:", tmp);
    setStartDate(tmp);
    // setStartDate(`${newItem.getFullYear()}-${newItem.getMonth()+1}-${newItem.getDate()}`);
    // console.log("StartDate:", startDate);
  }

  const handleFilterFlights = (newItem) => {
    // setFilterFlights((prevItems) => [...prevItems, newItem]);
    setFilterFlights(newItem);
    // console.log('list flight',filterFlights)
  }

  const handleSelectFlights = (newItem) => {
    // console.log("selectFlight", newItem)
    setSelectFlights(newItem)
  }

  const handleDurationDay = (newItem) => {
    setDurationDay(newItem)
    // console.log('day', durationDay)
  }
  const handleDurationNight = (newItem) => {
    setDurationNight(newItem)
    // console.log('night', durationNight)

  }

  return (

    <Routes>
      <Route path="/InsertData" element={
        <API_to_DB
          handleStartDate={handleStartDate}
          startDate={startDate}
        />
      }>
      </Route>

      <Route path='/' element={
        <div className="App">
          <Navbar handleFilterFlights={handleFilterFlights}
            handleDurationDay={handleDurationDay}
            handleDurationNight={handleDurationNight}
          />

          <Select_flights filterFlights={filterFlights}
            showLatLong={showLatLong}
            handleSelectFlights={handleSelectFlights}
            handleLatitudeChange={handleLatitudeChange}
            handleLongitudeChange={handleLongitudeChange}
          />

          <My_map flightsData={selectFlights}
            durationDay={durationDay}
            durationNight={durationNight}
            userLat={userLat}
            userLong={userLong}
            handleShowLatLong={handleShowLatLong}
            handleLatitudeChange={handleLatitudeChange}
            handleLongitudeChange={handleLongitudeChange}
            handleGridForExport={handleGridForExport}
          />

          <ExportToCSV gridForExport={gridForExport}/>
        </div>

      }></Route>
      <Route path="*" element={<div>404 Not Found</div>}></Route>
      

    </Routes>

  );
}

export default App;