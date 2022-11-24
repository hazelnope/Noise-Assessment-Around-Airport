import './App.css';
import React, { Component }  from 'react';
// import ReactEChartsCore from 'echarts-for-react/lib/core';

// import * as echarts from 'echarts/core';
import 'mapbox-echarts'
// import ReactECharts from 'echarts-for-react';
// import ReactMaptalk from 'react-maptalk'

import Navbar from './navbar'
import Map from './components/map';

function App() {
  return (
    <div className="App">
      <Navbar/>
      <Map/>
    </div>
  );
}

export default App;