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

  // const [selectdate, setSelectdate] = useState('Hello there')
  // const [selecttime, setSelectTime] = useState('')

  const handleFilterFlights = (newItem) => {
    // setFilterFlights((prevItems) => [...prevItems, newItem]);
    setFilterFlights(newItem);
    // console.log('list flight',filterFlights)
  }

  const handleSelectFlights = (newItem) => {
    console.log("selectFlight",newItem)
    setSelectFlights(newItem)
  }
  const handleLoading = (newItem) => {
    setLoading(newItem)
  }

  // const handleDateChange = (newDate) => {
  //   setSelectdate(newDate);
  // };

  // const handleTimeChange = (newTime) => {
  //   setSelectTime(newTime);
  // };

  return (
    <div className="App">
      {/* <button onClick={() => (
          setSelectdate("Reset")
        )}>
          Reset date
        </button> */}

      {/* <button onClick={() => (
          console.log(filterFlights)
        )}>
          log filterFlights
        </button> */}

      <Navbar handleFilterFlights={handleFilterFlights}
      // handleDateChange = {handleDateChange}
      // handleTimeChange = {handleTimeChange}
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
        isLoading={isLoading}/>
    </div>
  );
}

export default App;