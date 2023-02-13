import './App.css';
import React, { Component, useState } from 'react';
// import ReactEChartsCore from 'echarts-for-react/lib/core';

// import * as echarts from 'echarts/core';
import 'mapbox-echarts'
// import ReactECharts from 'echarts-for-react';
// import ReactMaptalk from 'react-maptalk'

import Navbar from './navbar'
import Map from './components/map';
import Map2 from './components/map_Vfunc';
import Select_flights from './components/select_flights';
import My_test_map from './components/test_map';
import API_to_DB from './components/api_to_db';
import NOP from './components/nop'
import User_Input from './components/user_input'

import "react-datepicker/dist/react-datepicker.css";


function App() {
  const [filterFlights, setFilterFlights] = useState([])
  const [selectFlights, setSelectFlights] = useState([])
  // const [isLoading, setLoading] = useState(false);
  const [durationDay, setDurationDay] = useState(0)
  const [durationNight, setDurationNight] = useState(0)
  const [startDate, setStartDate] = useState('2023-02-02');
  //----- user input -----//
  const [userLat, setUserLat] = useState(13.9133);
  const [userLong, setUserLong] = useState(100.6042);


  // const [selectdate, setSelectdate] = useState('Hello there')
  // const [selecttime, setSelectTime] = useState('')

  //----- user input -----//
  const handleLatitudeChange = (newItem) => {
    setUserLat(newItem);
    // console.log('userLatAPP:',userLat);
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
    let tmp = `${newItem.getFullYear()}-${newItem.getMonth()+1 < 10 ? '0' : ''}${newItem.getMonth()+1}-${newItem.getDate() < 10 ? '0' : ''}${newItem.getDate()}`;
    // console.log("date:",date);
    // console.log("month:",month);
    // console.log("year:",year);
    console.log("tmp:",tmp);
    setStartDate(tmp);
    // setStartDate(`${newItem.getFullYear()}-${newItem.getMonth()+1}-${newItem.getDate()}`);
    console.log("StartDate:",startDate);
  }

  const handleFilterFlights = (newItem) => {
    // setFilterFlights((prevItems) => [...prevItems, newItem]);
    setFilterFlights(newItem);
    // console.log('list flight',filterFlights)
  }

  const handleSelectFlights = (newItem) => {
    console.log("selectFlight", newItem)
    setSelectFlights(newItem)
  }
  // const handleLoading = (newItem) => {
  //   setLoading(newItem)
  // }
  const handleDurationDay = (newItem) => {
    setDurationDay(newItem)
    console.log('day',durationDay)
  }
  const handleDurationNight = (newItem) => {
    setDurationNight(newItem)
    console.log('night',durationNight)

  }
  // const handleDateChange = (newDate) => {
  //   setSelectdate(newDate);
  // };

  // const handleTimeChange = (newTime) => {
  //   setSelectTime(newTime);
  // };

  return (
    <div className="App">
      {/* <API_to_DB handleStartDate = {handleStartDate}
        startDate={startDate}
      /> */}

      {/* <NOP/> */}

      <User_Input handleLatitudeChange={handleLatitudeChange}
        handleLongitudeChange={handleLongitudeChange}
      />

      
      <Navbar handleFilterFlights={handleFilterFlights}
        handleDurationDay={handleDurationDay}
        handleDurationNight={handleDurationNight}
      />

      <Select_flights filterFlights={filterFlights}
        handleSelectFlights={handleSelectFlights}
      />

      <My_test_map flightsData={selectFlights}
        durationDay={durationDay}
        durationNight={durationNight}
        userLat={userLat}
        userLong={userLong}
      />
    </div>
  );
}

export default App;