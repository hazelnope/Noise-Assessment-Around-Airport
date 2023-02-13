import React, { Component, useState }  from 'react';
import DatePicker from "react-datepicker";

function API_to_DB(props) {

    // let startDate = new Date(props.startDate)
    const [startDate, setStartDate] = useState(new Date(props.startDate));

    // console.log('-----------',startDate)
    return (
        <DatePicker
            selected={startDate}
            onChange={(date) => props.handleStartDate(date)}
            // onChange={(date) => setStartDate(date)}
        />
    );
}

export default API_to_DB;