import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import D3Component from './components/D3Component';

const { NovelCovid } = require('novelcovid');
 



let vis;

 const App = () => {

  const [data, setData] = useState(null);
  const [width, setWidth] = useState(window.innerWidth / 1.2);
  const [height, setHeight] = useState(window.innerHeight / 1.2);
  const [active, setActive] = useState(null);
  const [error, setError] = useState(null);
  const refElement = useRef(null);

  useEffect(fetchData, []);
  useEffect(handleResizeEvent, []);
  useEffect(initVis, [ data ]);
  useEffect(updateVisOnResize, [ width, height ]);
  
  function getDate(dateString) {
    const date = dateString.split("/");
    return new Date(date[2] + "20", date[0] - 1, date[1])
};
  function fetchData() {
    const track = new NovelCovid();
    let arr = [];
    let obj = [];
    (async () => {
      try {
        const hist = await track.historical();
        hist.forEach(entry => obj.push({
          'country': entry.country + ' ' + entry.province,
          'cases': Object.values(entry.timeline.cases),
          'deaths': Object.values(entry.timeline.deaths),
          'recovered': Object.values(entry.timeline.recovered) 
        }))

        arr.push({'dates': Object.keys(hist[0].timeline.cases).map(entry => getDate(entry)),
                  'series': obj
                  });
        
        console.log(arr)                                
        setData(arr)
      } catch (e) {
        setError("Something went wrong when contacting the API, please try again later.")
        console.log(e)
      }
      
    })()
  };

  function handleResizeEvent() {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        setWidth(window.innerWidth / 1.2);
        setHeight(window.innerHeight / 1.2) ;
      }, 30);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  function initVis() {
    if(data && data.length) {
      const d3Props = {
        data,
        width,
        height,
      };
      vis = new D3Component(refElement.current, d3Props);
    }
  }

  function updateVisOnResize() {
    vis && vis.resize(width, height);
  }

  return (
    <div className='react-world'>
      <div>{active}</div>
      <div ref={refElement}/>
    </div>
  );
}

export default App;
