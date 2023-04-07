import React, { Component, useState } from 'react';
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import axios from 'axios';
import { url } from './../config';
import { useNavigate } from 'react-router-dom';
import { Oval } from 'react-loader-spinner'
import Alert from 'react-bootstrap/Alert';

import "./api_to_db.css"

function API_to_DB(props) {
  const [startDate, setStartDate] = useState(new Date())
  const [checkTime, setCheckTime] = useState(0)
  const [dataFromAxios, setDataFromAxios] = useState([])
  const [checkType, setCheckType] = useState(0)
  const [loadingStateFlightAware, setLoadingStateFlightAware] = useState(1);
  //----- for cal grids -----//
  const [startDateGrids, setStartDateGrids] = useState(new Date())
  const [checkTimeGrids, setCheckTimeGrids] = useState(0)
  const [dataFromGridsAxios, setDataFromGridsAxios] = useState([])
  const [selectData, setSelectData] = useState([])
  const [loadingState, setLoadingState] = useState(1)
  const [show, setShow] = useState(false);



  var temp_flight = []

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  }

  const options = [];
  for (let i = 0; i < 8; i++) {
    options.push(`${i < 4 ? '0' : ''}${i * 3}:00 - ${i < 3 ? '0' : ''}${i * 3 + 2}:59`);
  }
  const filter_path = ['Departures', 'Arrivals']

  const afterAxios = (flights) => {
    setDataFromAxios(flights)
    setLoadingStateFlightAware(1);
    console.log('flights_after_axios', flights);
    // console.log('flights_after_axios', dataFromAxios);
    // console.log('----------------------------')
  }

  const SecToDate = (sec) => {
    var dateFormat = new Date(1970, 0, 1);
    dateFormat.setSeconds(sec+25200);
    // console.log('sec date',dateFormat)

    dateFormat = `${dateFormat.getDate()}/${dateFormat.getMonth() + 1}/${dateFormat.getFullYear()}`
    return dateFormat;
  }

  const flights = dataFromAxios.map((flight) =>

    <div id={`tbg-btn-${flight['id']}-FlightAwareData`} value={flight['id']}>
      {/* {flight} */}
      {/* {flight.split("-")[0] + " - " + SecToDate(flight.split("-")[1]) + " - "} */}
      {flight['id'].split("-")[0] + " - " + SecToDate(flight['date']) + " - " + flight['D_or_A']}
    </div>
  );


  const loadData = async (startDateAxios, endDateAxios, timeAxios, checkType) => {
    // console.log(startDateAxios, endDateAxios, timeAxios, checkType)
    setLoadingStateFlightAware(0)
    // let startTime = performance.now()
    const response = await axios.post(url + 'get_flightaware', {
      'start_date': startDateAxios,
      'end_date': endDateAxios,
      'hour': timeAxios,
      'state': checkType,
    }).catch((error) => {
      console.log("error ->", error)
    }).then((response) => {
      console.log(response.data.res);
      afterAxios(response.data.res);
      // console.log(`myFunction took ${duration} seconds to run.`);
    }
    );
  }

  const clickToSend = () => {
    if (checkTime === 0) {
      // console.log("pls select time");
      return;
    }
    if (checkType === 0) {
      // console.log("pls select time");
      return;
    }

    let startDateAxios = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
    let endDateAxios = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
    let timeAxios = checkTime.split(':')[0]
    // let timeAxios = checkTime.split(':')[0]+7

    if (checkTime.split(':')[0] == 21) {
      // if (checkTime.split(':')[0] == 18) {
      let tmp = new Date(startDate.getTime());
      tmp.setDate(startDate.getDate() + 1);
      endDateAxios = `${tmp.getFullYear()}-${tmp.getMonth() + 1}-${tmp.getDate()}`
      // console.log("startDate:", startDate);
      // console.log("Enddd",tmp)
      // console.log('endDateAxios', endDateAxios);
      // console.log('--------------')
    }

    else {
      endDateAxios = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
      // console.log('endDateAxios', endDateAxios);
    }

    loadData(startDateAxios, endDateAxios, timeAxios, checkType)
  }

  const handleTimeClick = (eventKey) => {
    setCheckTime(eventKey);
    // console.log('time:', checkTime)
  }

  const handleTypeClick = (eventKey) => {
    setCheckType(eventKey.toLowerCase());
    // console.log('type:', checkType)
  }


  //----- For calculate Grids -----//

  const afterAxiosGrids = (flights) => {
    // console.log('after axios grid',flights)
    setDataFromGridsAxios(flights);
  }

  const flightsGrids = dataFromGridsAxios.map((flightGrids) =>
    <ToggleButton  variant={flightGrids['available_grid']===true? 'success':'warning'} class="blockSize" id={`tbg-btn-${flightGrids["id"]}-NoiseModel`} value={flightGrids["id"]}>
      {flightGrids['id'].split("-")[0] + " - " + SecToDate(flightGrids['date']) + " - " + flightGrids['D_or_A']}
    </ToggleButton>
  );

  const loadDataGrids = async (startDateGrids, timeGridsAxios) => {
    // console.log(startDateGrids, timeGridsAxios)

    axios.post(url + 'filter_flight', {
      // 2022-12-13 06:00:00
      'date': `${startDateGrids} ${timeGridsAxios}:00:00`
    }).then((response) => {
      console.log('get flights for cal grids', response.data.res)
      afterAxiosGrids(response.data.res)
    })
  }

  const clickToSendGrids = () => {
    if (checkTimeGrids === 0) {
      // console.log("pls select time");
      return;
    }

    let startDateGridsAxios = `${startDateGrids.getFullYear()}-${startDateGrids.getMonth() + 1}-${startDateGrids.getDate()}`
    let timeGridsAxios = checkTimeGrids.split(':')[0]

    loadDataGrids(startDateGridsAxios, timeGridsAxios)
  }

  const handleTimeClickGrids = (eventKey) => {
    setCheckTimeGrids(eventKey);
    // console.log('time:', checkTime)
  }

  const handleSetDataCalGrid = (val) => {
    // console.log(val)
    setSelectData(val)
  };

  const handleCalculateGrid = () => {
    // console.log("start calculate grids")
    setLoadingState(0)
    let startTime = performance.now()
    axios.post(url + 'web_cal_grid',
      selectData
    ).then((response) => {
      // console.log('after cal grid', response.data.res);
      setLoadingState(1);
      setShow(1)
      let duration = (performance.now() - startTime) / 1000;
      // console.log(`myFunction took ${duration} seconds to run.`);
    })
  }


  return (
    <div>
      <div class="FindFlightsAndCalGrids">
        <div class="FindFlights">
          <div class="DateTimeText">
            Search FlightAware Data
          </div>

          <div class="DateAndTimeFlight">
            <DatePicker
              placeholderText={'S E L E C T - D A T E'}
              selected={startDate}
              dateFormat='dd/MM/yyyy'
              // onChange={(date) => props.handleStartDate(date)}
              onChange={(date) => setStartDate(date)}
            />
            <div class="NavFlight">
              <NavDropdown title={checkTime ? checkTime : "S E L E C T - T I M E "} onSelect={handleTimeClick} id="navbarScrollingDropdown">
                {options.map((option) => (
                  <NavDropdown.Item eventKey={option} key={option}>
                    {option}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </div>


            <NavDropdown class="NavFlight" title={checkType ? checkType.charAt(0).toUpperCase() + checkType.slice(1) : "S E L E C T - T Y P E "} onSelect={handleTypeClick} id="navbarScrollingDropdown">
              {filter_path.map((option) => (
                <NavDropdown.Item eventKey={option} key={option}>
                  {option}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </div>

          <button class="SearchFlightButton" variant="primary" type="submit" onClick={clickToSend}>
            Search
          </button>

          <div>
            {dataFromAxios.length !== 0 ? <div class="textShowFlights">
              Available Flights
            </div> : null}


            {loadingStateFlightAware ?
              <div class="FlightAware">
                {flights}
              </div >
              :
              <div class="loadingOval">
                <Oval
                  height={80}
                  width={80}
                  color="#4fa94d"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                  ariaLabel='oval-loading'
                  secondaryColor="#4fa94d"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
              </div>
            }


          </div>
        </div>


        <div class="CalGrids">
          <div class="DateTimeText">
            Calculate Noise Model
          </div>

          <div class="DateAndTime">
            <DatePicker
              placeholderText={'S E L E C T - D A T E'}
              selected={startDateGrids}
              dateFormat='dd/MM/yyyy'
              // onChange={(date) => props.handleStartDate(date)}
              onChange={(date) => setStartDateGrids(date)}
            />

            <NavDropdown title={checkTimeGrids ? checkTimeGrids : "S E L E C T - T I M E "} onSelect={handleTimeClickGrids} id="navbarScrollingDropdown">
              {options.map((option) => (
                <NavDropdown.Item eventKey={option} key={option}>
                  {option}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

          </div>

          <button class="SearchFlightButton" variant="primary" type="submit" onClick={clickToSendGrids}>
            Search
          </button>

          <div >
            {dataFromGridsAxios.length !== 0 ? <div class="textShowFlights">
              Select Flights to Calculate
            </div> : null}

            {dataFromGridsAxios.length !== 0 ? <div class="textLabelGandY">
              <p style={{color: "green", display: "inline-block"}}>Green&nbsp;</p>
              <p style={{display: "inline-block"}}> : Calculated , </p>
              <p style={{color: "#FFBD00", display: "inline-block"}}> &nbsp;Yellow&nbsp;</p>
              <p style={{display: "inline-block"}}> : Uncalculated</p>
            </div> : null}

            {show ?
              <Alert variant="success" onClose={() => setShow(false)} dismissible>
                <Alert.Heading >Success</Alert.Heading>
              </Alert> : null}

            {loadingState ?
              <div>
                <div class="scrollBox">
                  <ToggleButtonGroup class={flightsGrids.length >= 5 ?'FlightGrids2':'FlightGrids'} value={selectData} onChange={handleSetDataCalGrid} type="checkbox" vertical={true}>
                    {flightsGrids}
                  </ToggleButtonGroup >
                </div>


                {dataFromGridsAxios.length !== 0 ? <button
                  class="CalgridButton"
                  variant="primary"
                  onClick={handleCalculateGrid}
                >
                  Calculate
                </button> : null}
              </div>
              :
              <div class="loadingOval">
                <Oval
                  height={80}
                  width={80}
                  color="#4fa94d"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                  ariaLabel='oval-loading'
                  secondaryColor="#4fa94d"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
              </div>
            }



          </div>
        </div>
      </div>

      <button class="BackButton" onClick={handleGoBack}>Go back</button>

    </div>

  );
}

export default API_to_DB;