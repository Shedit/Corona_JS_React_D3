
import * as d3 from 'd3';
import { least } from 'd3-array';

class D3Component {

  containerEl;
  props;
  svg;

  constructor(containerEl, props) {
    this.containerEl = containerEl;
    this.props = props;
    const { width, height } = props;
    this.svg = d3.select(containerEl)
      .append('svg')
      .style('background-color', '#fff')
      .attr('width', width)
      .attr('height', height)
      .attr('id', 'svg_container');
    this.updateDatapoints();
  }
  
  updateDatapoints = () => {
    console.log('update Datapoints called!')
    const { svg, props: { data, width, height, containerEl} } = this;
    const margin = ({top: 20, right: 20, bottom: 30, left: 60})
    const parser = d3.utcParse('%Y-%m-%d')

    let x = d3.scaleUtc()
                .domain(d3.extent(data[0].dates))
                .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
                .domain([0, d3.max(data[0].series, d => d3.max(d.cases))]).nice()
                .range([height - margin.bottom, margin.top])
    let myLine = d3.line()
                    .defined(d => !isNaN(d))
                    .x((d, i) => x(data[0].dates[i]))
                    .y(d => y(d))
                    .curve(d3.curveCardinal)
    
    let xAxis = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 3)
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text(data.y))
    
    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
    
    let path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
    .selectAll('path')
    .data(data[0].series)
    .join('path')
        .style("mix-blend-mode", "multiply")
        .attr('d', value => myLine(value.cases))
 

    function hover(svg) {
            if ("ontouchstart" in document) svg
                .style("-webkit-tap-highlight-color", "transparent")
                .on("touchmove", moved)
                .on("touchstart", entered)
                .on("touchend", left)
            else svg
                .on("mousemove", moved)
                .on("mouseenter", entered)
                .on("mouseleave", left);
          
            const dot = svg.append("g")
                .attr("display", "none");
          
            dot.append("circle")
                .attr("r", 2.5);
          
            dot.append("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
                .attr("text-anchor", "middle")
                .attr("y", -8);
          
            function moved() {
              d3.event.preventDefault();
              const mouse = d3.mouse(this); // returns [x,y] coordinates of a cursor in given element. 
              const xm = x.invert(mouse[0]); // return the domain value based on the the given input range.
              console.log('xm:', xm)
              const ym = y.invert(mouse[1]);
              console.log('ym:', ym)
              const i1 = d3.bisectLeft(data[0].dates, xm, 1);
              console.log('i1:', i1)
              const i0 = i1 - 1;
              console.log('i0:', i0)
              const i = xm - data[0].dates[i0] > data[0].dates[i1] - xm ? i1 : i0;
              console.log('i:', i)
              const s = least(data[0].series, d => Math.abs(d.cases[i] - ym));
              console.log('s:', s)
              path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
              console.log(s.cases[i])
              dot.attr("transform", `translate(${x(data[0].dates[i])},${y(s.cases[i])})`);
              dot.select("text").text(s.country + `\n` + s.cases[i]);
            }
          
            function entered() {
              path.style("mix-blend-mode", null).attr("stroke", "#eee");
              dot.attr("display", null);
            }
          
            function left() {
              path.style("mix-blend-mode", "multiply").attr("stroke", null);
              dot.attr("display", "none");
            }
          }

    svg.call(hover)

  }

  resize = (width, height) => {
    const { svg } = this;

    svg.selectAll("g").remove();
    this.props.width = width;
    this.props.height = height;

    svg.attr('width', width)
      .attr('height', height);

    this.updateDatapoints();
  }
}

export default D3Component;