import React from 'react';
import styles from './styles.css';
import {ButtonGroup, Button} from 'react-bootstrap';
import * as d3 from 'd3';

export default class DeviceGraph extends React.Component {
	constructor(props){
		super();

		this.engine = props.engine;
		this.d3 = {};

		this.state = {
			'view_mode': 'cpu',
			'engine_cpu': [],
			'engine_memory': []
		};
	}

	__init_d3(){
		var svg = this.d3.svg = d3.select(this.refs.graph).append('svg')
			.attr('width', (this.props.width || '600px') )
			.attr('height', (this.props.height || '400px') );
		var elemBox = this.d3.elemBox = svg.node().getBoundingClientRect();

		var margin = this.d3.margin = { left: 50, right: 30, top: 30, bottom: 50 };
		var size = this.d3.size = { width: elemBox.width - margin.left - margin.right, height: elemBox.height - margin.top - margin.bottom };

		var axes = this.d3.axes = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')');
		var x = this.d3.xScale = d3.scaleLinear().domain([ 0, 1 ]).range([ 0, size.width ]);
		var y = this.d3.yScale = d3.scaleLinear().domain([ -1, 1]).range([ size.height, 0 ]);
		var xAxis = this.d3.xAxis = d3.axisBottom(x).ticks(Math.floor(elemBox.width / 100)).tickFormat(d3.timeFormat('%H:%M:%S.%L'));
		var yAxis = this.d3.yAxis = d3.axisLeft(y);

		var xLine = this.d3.xLine = axes.append('g').attr('transform', 'translate(0, '+size.height+')').call(xAxis);
		var yLine = this.d3.yLine = axes.append('g').call(yAxis);

		var data = this.engine.stats.map(function(item){
			return { timestamp: item.timestamp, value: item.cpu };
		})

		var graph = this.d3.graph = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')');

		var realTimeFunc = this.d3.lineFunc = d3.line()
			.x(function(d, i){ return x(d.timestamp) })
			.y(function(d, i){ return y(d.value)})

		var realTimeLine = this.d3.engineLine = graph.append('path')
			.attr('d', realTimeFunc(data))
			.attr('stroke', 'red')
			.attr('stroke-width', 2)
			.attr('fill', 'none')
			// .attr('transform', 'translate('+margin.left+', '+margin.top+')')
	}

	__redraw_d3(){
		if (this.state.view_mode === 'cpu'){
			this.d3.xScale.domain([ this.state.engine_cpu[0].timestamp, this.state.engine_cpu[this.state.engine_cpu.length-1].timestamp ]);
			this.d3.yScale.domain([ 0, 100 ]);
			this.d3.yAxis.tickFormat((d)=>(d+' %'));

			this.d3.engineLine.datum(this.state.engine_cpu)
				.attr('d', this.d3.lineFunc);
		}
		else if (this.state.view_mode === 'memory'){
			this.d3.xScale.domain([ this.state.engine_memory[0].timestamp, this.state.engine_memory[this.state.engine_memory.length-1].timestamp ]);
			this.d3.yScale.domain([ 0, d3.max(this.state.engine_memory, function(d){ return d.value; }) * 1.1 ]);
			this.d3.yAxis.tickFormat((d)=>(d+' MB'));

			this.d3.engineLine.datum(this.state.engine_memory)
				.attr('d', this.d3.lineFunc);
		}
		
		this.d3.xLine.transition()
			.duration(250)
			.ease(d3.easeLinear,2)
			.call(this.d3.xAxis);
		
		this.d3.yLine
			// .transition()
			// .duration(500)
			// .ease(d3.easeLinear,2)
			.call(this.d3.yAxis);
	}

	componentDidMount(){
		console.log('DeviceGraph MOUNTED');
		this.__init_d3();

		this.handlerID = this.engine.on('resource-report', (data)=>{
			// console.log(data.timestamp+'    CPU: '+data.cpu+'    MEMORY: '+data.memory.heapUsed);

			this.setState({
				engine_cpu: this.state.engine_cpu.concat([{
					timestamp: data.timestamp,
					value: data.cpu
				}]),
				engine_memory: this.state.engine_memory.concat([{
					timestamp: data.timestamp,
					value: ( Math.round(data.memory.heapUsed / 10000) / 100 )
				}])
			});
		});
	}

	componentDidUpdate(){
		console.log('DeviceGraph UPDATED');
		this.__redraw_d3();
	}

	componentWillUnmount(){
		// clearInterval(this.timer);
		this.engine.removeHandler('resource-report', this.handlerID);
		console.log('DeviceGraph WILL UNMOUNT');
	}

	setViewMode(mode){
		this.setState({
			view_mode: mode
		});
	}

	render(){
		return (
			<div ref="graph">
				<div>
					<ButtonGroup>
						<Button onClick={(e)=>this.setViewMode('cpu')}>CPU</Button>
						<Button onClick={(e)=>this.setViewMode('memory')}>Memory</Button>
					</ButtonGroup>
				</div>
			</div>
		)
	}
}