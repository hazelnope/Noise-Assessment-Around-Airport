import React, { createRef, useEffect } from "react";
import ReactEcharts from 'echarts-for-react';
import 'echarts-gl'
import 'mapbox-echarts'
import * as maptalks from 'maptalks'
import { Select,Checkbox } from 'antd';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BsFillHandThumbs } from "react-icons/bs";


const { Option } = Select;

// var test_data = [{
//     name:'aa',
//     coords: [[100.5971, 13.8989, 700], [100.5837, 13.8755, 1700], [100.5572, 13.8620, 2400]],
//     date:'2022-10-04',
//     time_1:'17:23:06',
//     time_2:'17:24:10',
//     week:'1'
// },{
//     name:'aa',
//     coords: [[100.5971, 13.8989, 700], [100.5837, 13.8755, 1000], [100.5572, 13.8620, 2000]],
//     date:'2022-10-04',
//     time_1:'17:23:06',
//     time_2:'17:24:10',
//     week:'1'
// }]

var test_data = []

var test_scatter = [[100.5971, 13.8989, 15, "Hello World"]]
// var test_scatter = [[100.5971, 13.8989, 15, ▄]]

var map = {
    center: [100.6042,13.9133], 
    zoom: 13,
    altitudeScale: 100,
    pitch: 45,
    bearing: 15,
    baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        subdomains: ['a','b','c','d'],
        attribution: '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>'
    }),
}

const url = 'http://localhost:8000/';

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data : test_data,
            checkedList: [],
            list: [],
            scatter: test_scatter
        };
        this.flight = props.data
        this.check = props.name
        this.what = props.what

        this.getData = this.getData.bind(this);
    }

    componentWillMount(){
        if(this.what === "Flight no"){
            this.getData(this.flight)
        }
        axios.get(url+'get_flight').then((response) => {
            console.log(response.data);
            test_data.push(response.data);
            this.getData(test_data)
          })
          .catch((error) => {
            console.log(error)
          });

    }

    //---------- selected function-------------//

    onhandleChange(value,data) {
        var data_select = []
        var data_scatter = []
        this.setState({checkedList : value})
        for(var j=0;j<value.length;j++){
            for(var i=0;i<data.length;i++){
                if(data[i].name === value[j]){
                    var state = Math.floor((data[i].coords.length)/2)
                    data_select.push(data[i])
                    data_scatter.push([data[i].coords[state][0],data[i].coords[state][1],data[i].coords[state][2],data[i].name])
                }
            }
        }
        this.setState({data : data_select,scatter:data_scatter})
    }

    getData(result){
        this.setState({data : result})
    }

    //-----------draw chart-------------//

    getOption = () => ({
        maptalks3D: map, 
        series: [
            {
                type: 'scatter3D',
                coordinateSystem: 'maptalks3D',
                itemStyle: {
                    color: '(255, 0, 0)',
                    opacity: 1
                },
                data: this.state.scatter,
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
                data: this.state.data 
            }
        ],
    });
  
    render(props) {
      return (
        <div>
            {this.what === "Date" ?
            <Select
                mode="multiple"
                style={{ width: '50%',marginBottom:'2%' }}
                placeholder="Please select flight"
                value={this.state.checkedList}
                onChange={e => this.onhandleChange(e,this.flight)}
            >
                {this.check.map(flight => (
                        <Option style={{ fontSize: "1rem" }} key={flight}>{flight}</Option>
                ))}
            </Select>
            :
                null
            }
                <ReactEcharts option={this.getOption()} style={{width:'100%', height:800, border:'1px solid lightgray'}} />
        </div>
      );
    }
  }

  Map.propTypes = {
    data: PropTypes.array,
    name: PropTypes.array,
    what: PropTypes.string
  };
  
  export default Map;