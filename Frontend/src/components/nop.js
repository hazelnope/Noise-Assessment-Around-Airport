import React, { Component, useState }  from 'react';

function NOP() {
  const current = new Date();
  const date = `${current.getDate()}/${current.getMonth()+1}/${current.getFullYear()}`;
  console.log("new_date_NOP", current);
  console.log("date_NOP", date);

  return (
    <div className="App">
      <h1>Current date is {date}</h1>
    </div>
  );
} 

export default NOP;