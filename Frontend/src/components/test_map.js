import React, { createRef, useEffect, useState, useMemo } from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import { Select, Checkbox, Button } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';
import { url } from './../config';
// import { Marker } from 'google-maps-React';



const { Option } = Select;

var test_data = []

var test_scatter = []
var map = {
    center: [100.6042, 13.9133],
    zoom: 13,
    altitudeScale: 1,
    pitch: 45,
    bearing: 15,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    }),
}



var test_poly = [
    [100.6042, 13.9133], [100.6052, 13.9133], [100.6042, 13.9143], [100.6052, 13.9143]
]

// 100.505997	100.509997	100.513997/
// 14.007475 14.003475 13.999475


var test_bar = [[100.505997, 14.007475, 0.01],
[100.505997, 14.003475, 0.05],
[100.505997, 13.999475, 0.10],
[100.509997, 14.007475, 0.15],
[100.509997, 14.003475, 0.20],
[100.509997, 13.999475, 0.3],
[100.513997, 14.007475, 0.5],
[100.513997, 14.003475, 0.70],
[100.513997, 13.999475, 1.00]
]


const My_test_map = (props) => {
    const [data, setData] = useState([])
    const [scatter, setScatter] = useState(test_scatter)
    const [paramFlight, setParamFlight] = useState(props.flightsData)
    const [gridData, setGridData] = useState([])
    const [userLat, setUserLat] = useState(props.userLat)
    const [userLong, setUserLong] = useState(props.userLong)



    const getOption = () => ({
        maptalks3D: map,

        visualMap: {
            max: 90,
            inRange: {
                color: [
                    // '#1aa450',
                    // '#1aa450',
                    // '#45c03c',
                    // '#82d235',
                    // '#a7df40',
                    // '#cddd3e',
                    // '#dfd43e',
                    // '#e0b13f',
                    // '#e0a231',
                    // '#de8618',
                    // '#d46412',
                    // '#dc4413',
                    // '#de3a17',
                    // '#e02514',
                    // '#d01715',

                    //อันใหม่
                    // '#1aa450', //0
                    // '#4ded2d', //15
                    // '#aaed2d', //30
                    // '#eded2d', //45
                    // '#eda02d', //60
                    // '#ed732d', //75
                    // '#ed472d', //90

                    //อันหใม่กว่า
                    '#1aa450', //0
                    '#4ded2d', //18
                    '#4ded2d', //36
                    '#4ded2d', //54
                    '#eda02d', //72
                    '#ed472d', //90
                ]
            }
        },
        // grid3D: {
        // },

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
                name: 'Custom Marker',
                type: 'scatter3D',
                coordinateSystem: 'maptalks3D',
                itemStyle: {
                    normal: {
                      color: '#ddb926',
                      opacity: '1'
                    }
                  },
                data: scatter,
                symbolSize: 20,
                label: {
                    normal: {
                      formatter: '{b}',
                      position: 'right',
                      show: false
                    },
                    emphasis: {
                      show: true
                    }
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
            },
            {
                type: 'bar3D',
                coordinateSystem: 'maptalks3D',
                data: gridData,
                shading: 'color',
                barSize: 1.49,
                minHeight: 0,
                maxHeight: 11,
                label: {
                    show: false,
                    formatter: function (data) {
                        // return data.data[2];
                        return parseFloat(data.data[2]).toFixed(2);

                    },
                },
                itemStyle: {
                    opacity: 0.2
                },
                emphasis: {
                    label: {
                        opacity: 0.8,
                        fontSize: 20,
                        color: '#001855',
                    },
                    itemStyle: {
                        color: '#001855'
                    },
                }
            }
        ],
    });




    const getData = (result) => {
        // var data_select = []
        // var data_scatter = []
        // console.log('resulttttt', result)
        console.log('resulttttt', result)
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
            // console.log('dicts', itr_dict)
            setData(previousState => [...previousState, itr_dict])
        }
        // console.log("Data", data)
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
        // console.log("type ", typeof getOption)
        const fetchData = async () => {
            console.log('working....')
            setParamFlight(props.flightsData)
            const response = await axios.post(url + 'flight_path', {
                'flights': props.flightsData,
                'duration_day': props.durationDay,
                'duration_night': props.durationNight
            }).catch((error) => {
                console.log("error ->", error)
            });
            getData(response.data.res)
            console.log('response ', response.data);
            // console.log('grid', response.data.res[0].grid)
            setGridData(response.data.cumu_grid)
            // setGridData(response.data.res[0].grid)
            // props.handleLoading(false);

        }
        fetchData()


    }, [props.flightsData])

    return (
        <div>
            <ReactEcharts option={getOption()} notMerge={true}
                lazyUpdate={true} style={{ width: '100%', height: 800, border: '1px solid lightgray' }} />

        </div>
    );

}

My_test_map.propTypes = {
    data: PropTypes.array,
    name: PropTypes.array,
    what: PropTypes.string
};

export default My_test_map;