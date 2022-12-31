import './App.css';
import React, { Component, useState  }  from 'react';
// import ReactEChartsCore from 'echarts-for-react/lib/core';

// import * as echarts from 'echarts/core';
import 'mapbox-echarts'
// import ReactECharts from 'echarts-for-react';
// import ReactMaptalk from 'react-maptalk'

import Navbar from './navbar'
import Map from './components/map';
import Map2 from './components/map_Vfunc';


function App() {
  const [selectdate, setSelectdate] = useState('Hello there')
  const [selecttime, setSelectTime] = useState('')

  const handleDateChange = (newDate) => {
    setSelectdate(newDate);
  };

  const handleTimeChange = (newTime) => {
    setSelectTime(newTime);
  };

  return (
    <div className="App">
      <button onClick={() => (
          setSelectdate("Reset")
        )}>
          Reset date
        </button>

      <button onClick={() => (
          console.log(selectdate)
        )}>
          log date
        </button>
        
      <Navbar selectdate = {selectdate}
              handleDateChange = {handleDateChange}
              handleTimeChange = {handleTimeChange}
        /> 
      <Map selectdate = {selectdate}/>
      {/* <Map2/> */}
    </div>
  );
}

export default App;