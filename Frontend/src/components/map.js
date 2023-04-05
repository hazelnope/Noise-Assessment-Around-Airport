import React, { createRef, useEffect, useState, useMemo } from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import { Select, Checkbox, Button } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';
import { url } from '../config';



const { Option } = Select;

var test_data = []

var test_scatter = []
var map = {
    center: [100.6042, 13.9133],
    zoom: 13,
    altitudeScale: 1,
    pitch: 45,
    bearing: 15,
    // baseLayer: new maptalks.TileLayer('base', {
    //     // urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',   //อันเดิมสีขาว
    //     urlTemplate: "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png",
    //     subdomains: ['a', 'b', 'c', 'd'],
    //     attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    // }),

    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
    })
}



var test_poly = [
    [100.6042, 13.9133], [100.6052, 13.9133], [100.6042, 13.9143], [100.6052, 13.9143]
]


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
    const [markerPoint, setMarkerPoint] = useState([[0, 0, 0]])


    const SecToDate = (sec) => {
        var dateFormat = new Date(1970, 0, 1);
        dateFormat.setSeconds(sec + 25200);
        // dateFormat.setSeconds(sec);
        // console.log('sec date',dateFormat)

        // dateFormat = `${dateFormat.getFullYear()}/${dateFormat.getMonth() + 1}/${dateFormat.getDate()}`
        dateFormat = `${dateFormat.getDate()}/${dateFormat.getMonth() + 1}/${dateFormat.getFullYear()}`
        return dateFormat;
    }

    const getOption = () => ({

        maptalks3D: map,


        visualMap: {
            top: 10,
            right: 10,
            calculable: true,
            realtime: false,
            max: 100,
            inRange: {
                color: [
                    '#1aa450',
                    '#1aa450',
                    '#45c03c',
                    '#82d235',
                    '#a7df40',
                    '#cddd3e',
                    '#dfd43e',
                    '#e0b13f',
                    '#e0a231',
                    '#de8618',
                    '#d46412',
                    '#dc4413',
                    '#de3a17',
                    '#e02514',
                    '#d01715',

                    //colorset2
                    // '#1aa450', //0
                    // '#4ded2d', //15
                    // '#aaed2d', //30
                    // '#eded2d', //45
                    // '#eda02d', //60
                    // '#ed732d', //75
                    // '#ed472d', //90

                    //colorset3
                    // '#1aa450', //0
                    // '#4ded2d', //18
                    // '#4ded2d', //36
                    // '#4ded2d', //54
                    // '#eda02d', //72
                    // '#ed472d', //90
                ]
            }
        },

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
                    itemStyle:{
                        color: '(255, 0, 0)',
                        
                    },
                    formatter: function (flight) {
                        // console.log('flight',flight)
                        return flight[3];
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
                        return parseFloat(data.data[2]).toFixed(2);

                    },
                },
                itemStyle: {
                    opacity: 0.15
                },
                emphasis: {
                    label: {
                        opacity: 1,
                        fontSize: 20,
                        color: '#000000',
                    },
                    itemStyle: {
                        color: '#000000'
                    },
                }
            },
            {
                name: 'Custom Marker',
                type: 'bar3D',
                coordinateSystem: 'maptalks3D',
                data: markerPoint,
                shading: 'realistic',
                barSize: 1.49,
                label: {
                    fontSize: 20,
                    show: true,
                    color: '#000000',
                    formatter: function (data) {
                        return parseFloat(data.data[2]).toFixed(2);
                    }
                },
                itemStyle: {
                    opacity: 1,
                },
                emphasis: {
                    itemStyle: {
                        // Color in emphasis state.
                        color: 'thistle'
                    }
                }
            }
        ],
    });





    const getData = (result) => {
        // console.log('resulttttt', result)
        setData([])
        setScatter([])
        for (const flight in result) {
            let scatter_location = result[flight].value[5]
            let scatter_name = result[flight].id
            scatter_name = scatter_name.split("-")[0] + " - " + SecToDate(result[flight].date) + " - " + result[flight].D_or_A
            let scatter_variable = [...scatter_location, scatter_name]
            // variable = [long, lat, alt, name]
            setScatter(previousState => [...previousState, scatter_variable])
            // console.log('scatter', scatter_variable)
            let itr_dict = {}
            itr_dict['coords'] = result[flight].value
            itr_dict['name'] = result[flight].id
            setData(previousState => [...previousState, itr_dict])
        }
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function distance(lat1, lon1, lat2, lon2) {
        const R = 6371; // radius of the earth in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d;
    }
    // const coords = [[13.895474999999992, 100.64999700000016], [13.935474999999988, 100.56599700000005]];
    const coords = gridData;

    function shortest_point() {
        let minDistance = null;
        let minCoord = null;
        // console.log('lat long2', props.userLat, props.userLong)
        if (props.userLat === null || props.userLat > 13.99 || props.userLat < 13.83 || props.userLong > 100.69 || props.userLong < 100.52) {
            return [0, 0, 0]
        }
        let cor = [props.userLat, props.userLong];

        for (let i = 0; i < gridData.length; i++) {
            const coord = gridData[i];
            const d = distance(cor[0], cor[1], coord[1], coord[0]);
            if (minDistance === null || d < minDistance) {
                minDistance = d;
                minCoord = coord;
            }
        }
        return minCoord;
    }



    useEffect(() => {
        // console.log('lat long', props.userLat, props.userLong)
        // console.log("marker", markerPoint);

        if (props.userLong !== 0 && props.userLat !== 0) {
            // console.log("marker", markerPoint);
            let point_A = shortest_point();

            // setMarkerPoint([[point_A[0], point_A[1], point_A[2]*10]])
            setMarkerPoint([point_A])
        }
        else {
            setMarkerPoint([[0, 0, 0]])
        }


    }, [props.userLong, props.userLat]);



    useEffect(() => {
        const fetchData = async () => {
            // console.log('working....')
            setParamFlight(props.flightsData)
            const response = await axios.post(url + 'flight_path', {
                'flights': props.flightsData,
                'duration_day': props.durationDay,
                'duration_night': props.durationNight
            }).catch((error) => {
                console.log("error ->", error)
            });
            setGridData(response.data.cumu_grid)
            props.handleGridForExport(response.data.cumu_grid)
            getData(response.data.res)
            // console.log('response ', response.data);
            // console.log('grid_nop:', gridData);
        }
        fetchData();

    }, [props.flightsData])

    useEffect(() => {
        if (gridData.length !== 0) {
            // console.log('show')
            props.handleShowLatLong(1)
        }
        else {
            // console.log('not show')
            props.handleLatitudeChange(null)
            props.handleLongitudeChange(null)
            props.handleShowLatLong(0)
        }
    }, [gridData]);

    return (
        <div>
            <ReactEcharts option={getOption()} notMerge={true}
                lazyUpdate={true} style={{ width: '100%', height: 700, border: '1px solid lightgray' }} />


        </div>
    );

}

My_test_map.propTypes = {
    data: PropTypes.array,
    name: PropTypes.array,
    what: PropTypes.string
};

export default My_test_map;