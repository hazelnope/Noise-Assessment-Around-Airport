import React, { Component, useState } from 'react';
import Papa from 'papaparse';

import "./export_to_csv.css"

function To_CSV(props) {

    const data = props.gridForExport

    function convertToCSV(data) {
        const header = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).join(","));
        return `${header}\n${rows.join("\n")}`;
    }

    const download = (result) => {
        // console.log('-----------------------------------------');
        // console.log('Result', result);
        // console.log('data', data);

        const csv2 = convertToCSV(result);
        const blob = new Blob([csv2], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "Result.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const downloadFile = () => {
        // console.log('data',data);
        // console.log('length',data[0].length);
        let result = {};

        for (var i = 0; i < data.length; i++) {
            if (!result[data[i][0]]) {
                result[data[i][0]] = {};
            }
            result[data[i][0]][data[i][1]] = data[i][2]
        }
        
        const convertedDataframe = Object.entries(result).map(([key, value]) => ({
            'Long/Lat': key,
            ...value
        }));
        // console.log('result', convertedDataframe);

        download(convertedDataframe);
    }

    return (
        <div class="Download">
            <div class="textDownloadFile">
                Export Output to File
            </div>
            <button class="DownloadFileButton" variant="primary" type="submit" onClick={downloadFile}>
                Download
            </button>
        </div>
    )
}

export default To_CSV;