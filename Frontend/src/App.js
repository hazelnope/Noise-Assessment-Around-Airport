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


function App() {
  const [filterFlights, setFilterFlights] = useState([])
  const [selectFlights, setSelectFlights] = useState([])
  const [isLoading, setLoading] = useState(false);
  const [durationDay, setDurationDay] = useState(0)
  const [durationNight, setDurationNight] = useState(0)

  // const [selectdate, setSelectdate] = useState('Hello there')
  // const [selecttime, setSelectTime] = useState('')

  const handleFilterFlights = (newItem) => {
    // setFilterFlights((prevItems) => [...prevItems, newItem]);
    setFilterFlights(newItem);
    // console.log('list flight',filterFlights)
  }

  const handleSelectFlights = (newItem) => {
    console.log("selectFlight", newItem)
    setSelectFlights(newItem)
  }
  const handleLoading = (newItem) => {
    setLoading(newItem)
  }
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

      
      <Navbar handleFilterFlights={handleFilterFlights}
        handleDurationDay={handleDurationDay}
        handleDurationNight={handleDurationNight}
      />

      {/* <Map selectdate = {selectdate}/> */}
      <Select_flights filterFlights={filterFlights}
        handleSelectFlights={handleSelectFlights}
        handleLoading={handleLoading}
        isLoading={isLoading}
      />
      {/* <Map2 flightsData={selectFlights}
        handleLoading={handleLoading}
        isLoading={isLoading}
      /> */}
      <My_test_map flightsData={selectFlights}
        handleLoading={handleLoading}
        isLoading={isLoading} 
        durationDay={durationDay}
        durationNight={durationNight}
        />
    </div>
  );
}

export default App;