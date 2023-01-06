import React, { createRef, useEffect, useState } from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import { Select, Checkbox } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';
import { url } from './../config';



const { Option } = Select;

var test_data = []

// var test_scatter = [[100.5971, 13.8989, 15, "Hello World"]]
// var test_scatter = [[100.5971, 13.8989, 15, ▄]]
var test_scatter = []
var map = {
    center: [100.6042, 13.9133],
    zoom: 13,
    altitudeScale: 100,
    pitch: 45,
    bearing: 15,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    }),
}




const Map2 = (props) => {
    const [data, setData] = useState([])
    const [scatter, setScatter] = useState(test_scatter)
    const [paramFlight, setParamFlight] = useState(props.flightsData)

    const getOption = () => ({
        maptalks3D: map,
        series: [
            {
                type: 'scatter3D',
                coordinateSystem: 'maptalks3D',
                itemStyle: {
                    color: '(255, 0, 0)',
                    opacity: 1
                },
                data: scatter,
                symbolSize: 1,
                label: {
                    show: true,
                    formatter: function (data) {
                        return data[3];
                    },
                    position: 'insideTop'
                },
            },
            {
                type: 'lines3D',
                coordinateSystem: 'maptalks3D',
                effect: {
                    show: false,
                    constantSpeed: 40,
                    trailWidth: 2,
                    trailLength: 0.05,
                    trailOpacity: 1,
                },
                polyline: true,
                lineStyle: {
                    width: 2,
                    color: 'rgb(50, 60, 170)',
                    opacity: 0.5
                },
                data: data
            }
        ],
    });

    const getData = (result) => {
        // var data_select = []
        // var data_scatter = []
        console.log('resulttttt', result)
        // console.log('resulttttt', result)
        // setData(result)
        setData([])
        setScatter([])
        for (const flight in result) {
            let scatter_location = result[flight].value[5]
            let scatter_name = result[flight].id
            let scatter_variable = [...scatter_location, scatter_name]
            // variable = [long, lat, alt, name]
            setScatter(previousState => [...previousState, scatter_variable])
            console.log('scatter', scatter_variable)
            let itr_dict = {}
            itr_dict['coords'] = result[flight].value
            itr_dict['name'] = result[flight].id
            // console.log('flight', flight)
            // console.log(result[flight].value)
            console.log('dicts', itr_dict)
            setData(previousState => [...previousState, itr_dict])
        }
        console.log("Data", data)
    }


    useEffect(() => {
        // setParamFlight(props.flightsData)
        // console.log('param', paramFlight)
        // axios.get(url+'get_flight').then((response) => {
        //     // console.log(response.data);
        //     test_data.push(response.data);
        //     getData(test_data)
        //   })
        //   .catch((error) => {
        //     console.log(error)
        //   });

        const fetchData = async () => {
            console.log('working....')
            setParamFlight(props.flightsData)
            const response = await axios.post(url + 'flight_path', { 'flights': props.flightsData }).catch((error) => {
                console.log("error ->", error)
            });
            getData(response.data.res)
            console.log('response ', response.data.res);
            props.handleLoading(false);

        }
        fetchData()


    }, [props.flightsData])

    return (
        <div>
            <ReactEcharts option={getOption()} style={{ width: '100%', height: 800, border: '1px solid lightgray' }} />
        </div>
    );

}

Map2.propTypes = {
    data: PropTypes.array,
    name: PropTypes.array,
    what: PropTypes.string
};

export default Map2;