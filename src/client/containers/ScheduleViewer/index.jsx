import React from 'react';
import {connect} from 'react-redux';
import {Row, Col, ButtonGroup, Button, Table, Tabs, Tab} from 'react-bootstrap';
import * as d3 from 'd3';

import EngineQuickCtrl from '../EngineQuickCtrl/';
import ApplicationCtrl from '../ApplicationCtrl/';

import style from './style.css';

class ScheduleViewer extends React.Component {
	constructor (props){
		super();
		this.$dash = props.dash;
		this.handlerID = null;
		this.d3 = {};

		this.state = {
			scheduler_events: props.history.filter((item)=>item.type==='scheduler-event'),
			engine_events: props.history.filter((item)=>item.type==='engine-registry-update'),
			program_events: props.history.filter((item)=>item.type==='program-monitor-update'),
			viewing: {
				type: null,
				data: null
			}
		}
	}

	showInfo(event_type, data){
		this.setState({
			viewing: {
				type: event_type,
				data: data
			}
		})
	}

	__init_d3 (){
		var svg = d3.select(this.refs.graph).append('svg')
			.attr('width', (this.props.width || '600px') )
			.attr('height', (this.props.height || '400px') );

		var elemBox = svg.node().getBoundingClientRect();

		var margin = { left: 120, right: 30, top: 30, bottom: 50 };
		var size = { width: elemBox.width - margin.left - margin.right, height: elemBox.height - margin.top - margin.bottom };

		var axes = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')');
		var x = d3.scaleLinear().range([ 0, size.width ]);

		// if (this.engine.stats.length > 0){
		// 	x.domain([ this.engine.stats[0].timestamp, this.engine.stats[this.engine.stats.length-1].timestamp ]);
		// }
		// else {
			x.domain([ Date.now() - 1000, Date.now() ]);
		// }

		var y = d3.scaleLinear().domain([ 0, 10 ]).range([ 0, size.height ]);
		var xAxis = d3.axisBottom(x).ticks(Math.floor(elemBox.width / 100)).tickFormat(d3.timeFormat('%H:%M:%S.%L'));
		var yAxis = d3.axisLeft(y);

		var xLine = axes.append('g').attr('transform', 'translate(0, '+size.height+')').call(xAxis);
		var yLine = axes.append('g').call(yAxis);

		var grid = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')');

		var infoPane = svg.append('g')
			.attr('transform', 'translate('+margin.left+', '+margin.top+')')
			.attr('style', 'z-index: 100;');

		infoPane.append('rect')
			.attr('class', 'info-pane')
			.attr('fill', 'rgb(255,255,255)')
			.attr('stroke', 'rgb(0,0,0)')
		infoPane.append('text')
			.attr('class', 'info-text')

		var mouseTrack = grid.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', size.height)
			.attr('style', 'stroke: rgb(220,180,180); stroke-width: 1;');
		var mouseText = grid.append('text')
			.attr('x', 0)
			.attr('y', 0);

		var mouseCursor = grid.append('line')
			.attr('x1', 0)
			.attr('x2', 0)
			.attr('y1', 0)
			.attr('y2', size.height);
		var cursorText = grid.append('text').attr('x',0).attr('y',0)

		svg.on('mousemove', ()=>{
				var mousePos = d3.mouse(grid.node());
				var timestamp = d3.timeFormat('%H:%M:%S.%L')(x.invert(mousePos[0]));
				// console.log(mousePos);
				mouseTrack.attr('x1', mousePos[0]).attr('x2', mousePos[0]);
				mouseText.attr('x', mousePos[0])
					.text(timestamp);
			});
		svg.on('mouseup', ()=>{
				var mousePos = d3.mouse(grid.node());
				this.d3.cursorAt = x.invert(mousePos[0]);
				// console.log(mousePos, Math.floor(x.invert(mousePos[0])));
				mouseCursor.attr('x1', mousePos[0]).attr('x2', mousePos[0])
					.attr('style', 'stroke: rgb(100,100,255); stroke-width: 2;');
				cursorText.attr('x', mousePos[0]).text(d3.timeFormat('%H:%M:%S.%L')(this.d3.cursorAt));
			});

		// var lineFunc = d3.line()
		// 	.x(function(d, i){ return x(d.timestamp) })
		// 	.y(function(d, i){ return y(d.value)})

		var colors = d3.scaleOrdinal(d3.schemeCategory10);

		this.d3.svg = svg;
		this.d3.elemBox = elemBox;
		this.d3.margin = margin;
		this.d3.size = size;
		this.d3.view = { from: 0, to: 0 };
		this.d3.axes = axes;
		this.d3.xScale = x;
		this.d3.yScale = y;
		this.d3.xAxis = xAxis;
		this.d3.yAxis = yAxis;
		this.d3.xLine = xLine;
		this.d3.yLine = yLine;
		this.d3.grid = grid;
		this.d3.infoPane = infoPane;
		this.d3.cursor = mouseCursor;
		this.d3.cursorText = cursorText;
		// this.d3.lineFunc = lineFunc;
		this.d3.colors = colors;

		this.d3.panLeft = ()=>{
			var domain = x.domain();
			var zoom = domain[1] - domain[0];
			var panStep = zoom * 0.1;
			this.d3.view.from = domain[0] - panStep;
			this.d3.view.to = this.d3.view.from + zoom;
			this.__redraw_d3()
		}
		this.d3.panRight = ()=>{
			var domain = x.domain();
			var zoom = domain[1] - domain[0];
			var panStep = zoom * 0.1;
			this.d3.view.from = domain[0] + panStep;
			this.d3.view.to = this.d3.view.from + zoom;
			this.__redraw_d3()
		}
		this.d3.zoomIn = ()=>{
			var domain = x.domain();
			var zoom = (domain[1] - domain[0]) * 0.8;
			var panStep = zoom * 0.1;
			this.d3.view.from = domain[0] + (domain[1] - domain[0] - zoom) / 2;
			this.d3.view.to = this.d3.view.from + zoom;
			this.__redraw_d3()
		}
		this.d3.zoomOut = ()=>{
			var domain = x.domain();
			var zoom = (domain[1] - domain[0]) / 0.8;
			var panStep = zoom * 0.1;
			this.d3.view.from = domain[0] - (zoom - domain[1] + domain[0]) / 2;
			this.d3.view.to = this.d3.view.from + zoom;
			this.__redraw_d3()
		}
		this.d3.resetView = ()=>{
			this.d3.view.from = 0;
			this.d3.view.to = 0;
			this.__redraw_d3()
		}

		// Actual elements that will represent incoming data
		this.d3.schedulerEvents = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')').attr('class', 'scheduler-events-graph');
		this.d3.engineEvents = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')').attr('class', 'engine-events-graph');
		this.d3.programEvents = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')').attr('class', 'program-events-graph');
	}

	__redraw_d3_grid(){
		var vlines = this.d3.grid.selectAll('.grid-vline')
			.data(this.d3.xScale.ticks());

		vlines.attr('x1', (d)=>{ return this.d3.xScale(d) })
			.attr('x2', (d)=>{ return this.d3.xScale(d) });
		vlines.exit().remove();
		vlines.enter()
			.append('line')
			.attr('class', 'grid-vline')
			.attr('x1', (d)=>{ return this.d3.xScale(d) })
			.attr('x2', (d)=>{ return this.d3.xScale(d) })
			.attr('y1', 0)
			.attr('y2', this.d3.size.height)
			.attr('style', 'stroke: rgb(210,210,210); stroke-width: 1;');

		var hlines = this.d3.grid.selectAll('.grid-hline')
			.data(this.d3.yScale.ticks());

		hlines.attr('y1', (d)=>{ return this.d3.yScale(d) })
			.attr('y2', (d)=>{ return this.d3.yScale(d) });
		hlines.exit().remove();
		hlines.enter()
			.append('line')
			.attr('class', 'grid-hline')
			.attr('x1', 0)
			.attr('x2', this.d3.size.width)
			.attr('y1', (d)=>{ return this.d3.yScale(d) })
			.attr('y2', (d)=>{ return this.d3.yScale(d) })
			.attr('style', 'stroke: rgb(210,210,210); stroke-width: 1;');

		// update mouse cursor position (x domain changed, so the position needs to be updated)
		if (this.d3.cursorAt){
			var cursorAt = this.d3.xScale(this.d3.cursorAt);
			this.d3.cursor.attr('x1', cursorAt).attr('x2', cursorAt)
				.attr('style', 'stroke: rgb(100,100,255); stroke-width: 2;');
			this.d3.cursorText.attr('x', cursorAt);
		}
	}

	__show_d3_info (x, y, text){
		var text = this.d3.infoPane.select('.info-text')
			.text(text)
			.attr('x', x)
			.attr('y', y)
			.attr('style', 'visibility: visible;');
		var textBox = text.node().getBBox();

		this.d3.infoPane.select('.info-pane')
			.attr('x', textBox.x)
			.attr('y', textBox.y)
			.attr('width', textBox.width)
			.attr('height', textBox.height)
			.attr('style', 'visibility: visible;')

		this.d3.infoPane.raise();
	}

	__hide_d3_info (){
		this.d3.infoPane.select('.info-pane')
			.attr('style', 'visibility: hidden;')
		this.d3.infoPane.select('.info-text')
			.attr('style', 'visibility: hidden;')
	}

	__redraw_d3_events(type){
		var block = this.d3.yScale(1);

		// Update Scheduler Events
		var sched_updates = this.d3.schedulerEvents.selectAll('rect')
			.data(this.state.scheduler_events, (d)=>d.key);
		sched_updates
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', 0)
			.attr('height', block)
		sched_updates.exit().remove();

		var schedElem = sched_updates.enter().append('g');
		schedElem.append('rect')
			.attr('class', (d)=>('scheduler_event'))
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', 0)
			.attr('height', block)
			.attr('width', 5)
			.attr('fill', 'red')

		// Update Engine Grid Boundaries First
		var grid_updates = this.d3.grid.selectAll('.engine-box')
			.data(this.d3.yMap.engines, (d)=>d.id);
		grid_updates
			.attr('y', (d)=>this.d3.yScale(d.yIndex))
			.attr('height', (d)=>((1 + d.procs.length) * block ))
		grid_updates.exit().remove();

		var gridElem = grid_updates.enter().append('g');
		gridElem.append('rect')
			.attr('class', 'engine-box')
			.attr('x', 0)
			.attr('y', (d)=>this.d3.yScale(d.yIndex))
			.attr('height', (d)=>((1 + d.procs.length) * block ))
			.attr('width', this.d3.size.width)
			.attr('fill', 'rgba(255,255,255,0)')
			.attr('stroke', 'rgb(150,150,150)')
			.attr('stroke-width', 1)
			.on('mouseover', function(d){ 
				d3.select(this).attr('fill', 'rgba(250,100,100,0.5)')
				gridElem.selectAll('text').attr('style', 'visibility: visible;')
				})
			.on('mouseout', function(d){ 
				d3.select(this).attr('fill', 'rgba(255,255,255,0)') 
				gridElem.selectAll('text').attr('style', 'visibility: hidden;')
				})
		gridElem.append('text')
			.attr('x', this.d3.size.width / 2)
			.attr('y', (d)=>this.d3.yScale(d.yIndex) + ((1 + d.procs.length) * block ) / 2)
			.text((d)=>('Engine '+d.id))
			.attr('style', 'visibility: hidden;')


		// Update Engine Resource Graphs
		var gy = d3.scaleLinear().domain([ 0, 100 ]).range([ block, 0 ])
		var getEnginePlot = (engine)=>{ 
			var lineFunc = d3.line()
				.x((d, i)=>this.d3.xScale(d.timestamp))
				.y((d, i)=>gy(d.value) + this.d3.yScale(engine.yIndex))
			var engineData = this.props.engines[engine.id].stats.map((item)=>{
				return { timestamp: item.timestamp, value: item.cpu };
			})
			return lineFunc(engineData)
		}
		var eng_graphs = this.d3.engineEvents.selectAll('.engine-graph')
				.data(this.d3.yMap.engines, (d)=>d.id);
		eng_graphs.selectAll('path')
			.attr('d', getEnginePlot)
		eng_graphs.exit().remove();
		eng_graphs.enter().append('path')
			.attr('class', 'engine-graph')
			.attr('d', getEnginePlot)
			.attr('stroke', 'rgba(100,100,100,0.5)')
			.attr('stroke-width', 1)
			.attr('fill', 'none');

		// Update Engine Events
		var getEngineY = (d)=>{
			var engine = this.d3.yMap.engines.find((item)=>item.id === d.data.engine);
			return this.d3.yScale(engine.yIndex);
			// return this.d3.yScale(engine.yIndex) + ((1 + engine.procs.length) * block);
		}
		var getEngineHeight = (d)=>{
			var engine = this.d3.yMap.engines.find((item)=>item.id === d.data.engine);
			console.log(block);
			return (1 + engine.procs.length) * block;
		}

		var eng_updates = this.d3.engineEvents.selectAll('rect')
			.data(this.state.engine_events, (d)=>d.key);
		eng_updates
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', getEngineY )
			.attr('height', block)
		eng_updates.exit().remove();

		var engElem = eng_updates.enter().append('g');
		engElem.append('rect')
			.attr('class', (d)=>('engine_'+d.data.engine))
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', getEngineY )
			// .attr('height', getEngineHeight)
			.attr('height', block)
			.attr('width', 5)
			// .attr('height', 40)
			.attr('fill', 'rgb(200,200,200)')
			.on('mouseover', function(d){
				self.__show_d3_info(self.d3.xScale(d.timestamp), getEngineY(d), 'Engine '+d.data.engine+' ('+d.data.status+')');
			})
			.on('mouseout', function(d){
				self.__hide_d3_info();
			})
			// .on('mouseover', function(d){ d3.select(this).attr('r', 10) })
			// .on('mouseout', function(d){ d3.select(this).attr('r', 5) })

		// Update Program Resource Graphs
		var getProgramPlot = (program)=>{ 
			var lineFunc = d3.line()
				.x((d, i)=>this.d3.xScale(d.timestamp))
				.y((d, i)=>gy(d.value) + this.d3.yScale(program.yIndex));
			console.log(this.props.programs, program);
			if (program.id in this.props.programs){
				var programData = this.props.programs[program.id].stats.map((item)=>{
					return { timestamp: item.timestamp, value: item.cpu };
				})
				return lineFunc(programData)
			}
			return lineFunc([])
		}
		var pro_graphs = this.d3.programEvents.selectAll('.program-graph')
				.data(this.d3.yMap.programs, (d)=>d.id)
				.attr('d', getProgramPlot)
		pro_graphs.exit().remove();
		pro_graphs.enter().append('path')
			.attr('class', 'program-graph')
			.attr('d', getProgramPlot)
			.attr('stroke', (d)=>this.d3.colors(this.d3.yMap.programs.findIndex((item)=>item.id===d.id)))
			.attr('stroke-width', 2)
			.attr('opacity', 0.5)
			.attr('fill', 'none');
			// .attr('fill', (d)=>this.d3.colors(this.d3.yMap.programs.findIndex((item)=>item.id===d.id)));

		// Update Program Events
		var getProgramY = (d)=>{
			// console.log(this.d3.yMap.programs, d);
			var proc = this.d3.yMap.programs.find((item)=>{ return (item.id === d.data.instance_id) && (item.engine === d.data.engine) });
			return this.d3.yScale(proc.yIndex);
		}
		var getColor = (d)=>{
			var proc = this.d3.yMap.programs.findIndex((item)=>item.id === d.data.instance_id);
			return this.d3.colors(proc);
		};
		var pro_updates = this.d3.programEvents.selectAll('rect')
			.data(this.state.program_events, (d)=>d.key);
		pro_updates
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', getProgramY )
			.attr('height', block)
		pro_updates.exit().remove();

		var self = this;
		var proElem = pro_updates.enter().append('g');
		proElem.append('rect')
			.attr('class', (d)=>('program_'+d.data.instance_id))
			.attr('x', (d)=>this.d3.xScale(d.timestamp))
			.attr('y', getProgramY )
			// .attr('height', getEngineHeight)
			.attr('height', block)
			.attr('width', 5)
			// .attr('height', 40)
			.attr('fill', getColor)
			.on('mouseover', function(d){
				self.__show_d3_info(self.d3.xScale(d.timestamp), getProgramY(d), d.data.code_name+' '+d.data.instance_id+' ('+d.data.status+')');
			})
			.on('mouseout', function(d){
				self.__hide_d3_info();
			})
	}

	__redraw_d3(){
		console.log('Redrawing Schedule Graph', this.state);
		if (this.props.history.length > 0){
			// this.d3.xScale.domain([ this.props.history[0].timestamp, this.props.history[this.props.history.length-1].timestamp ]);
			if (this.d3.view.from === 0 || this.d3.view.to === 0){
				this.d3.xScale.domain(d3.extent(this.props.history, (d)=>{ return d.timestamp }));	
			}
			else {
				this.d3.xScale.domain([this.d3.view.from, this.d3.view.to]);
			}
		}
		else {
			this.d3.xScale.domain([ Date.now() - 1000, Date.now() ]);
		}

		this.d3.xLine.call(this.d3.xAxis);

		var yMap = {
			engines: [],
			programs: [],
			labels: [ 'Scheduler' ]
		};
		Object.values(this.props.engines)
			.forEach((engine)=>{
				var procs = engine.getProcesses();
				yMap.engines.push({
					id: engine.id,
					procs: procs,
					yIndex: yMap.labels.length
				});
				yMap.labels.push('Engine '+engine.id);

				procs.forEach((proc)=>{
					yMap.programs.push({
						id: proc.instance_id,
						engine: engine.id,
						yIndex: yMap.labels.length
					});
					yMap.labels.push(proc.code_name+' '+proc.instance_id)
				});
			});
		this.d3.yMap = yMap;

		this.d3.yScale.domain([ 0, yMap.labels.length ]);
		this.d3.yLine.call(this.d3.yAxis);
		this.d3.yAxis.tickFormat((d)=>(d % 1 === 0 ? yMap.labels[d] : ''));
		// this.d3.yAxis.tickFormat((d)=>{
		// 	console.log(d);
		// 	return ((d % 1 === 0) ? (d===0 ? 'Scheduler' : yMap.programs[d-1].id) : '')
		// });

		this.__redraw_d3_grid();

		this.__redraw_d3_events();
	}

	componentDidMount(){
		this.__init_d3();
		this.__redraw_d3();

		this.handlerID = this.$dash.on('system-event', (event_data)=>{
			if (event_data.type === 'scheduler-event'){
				this.setState({
					scheduler_events: this.state.scheduler_events.concat([event_data])
				});
				this.__redraw_d3();
			}
			else if (event_data.type === 'engine-registry-update'){
				this.setState({
					engine_events: this.state.engine_events.concat([event_data])
				});
				this.__redraw_d3();
			}
			else if (event_data.type === 'program-monitor-update'){
				this.setState({
					program_events: this.state.program_events.concat([event_data])
				});
				this.__redraw_d3();
			}
		});
	}

	componentWillUnmount(){
		this.$dash.removeHandler('system-event', this.handlerID);
	}

	componentDidUpdate(prevProps){
		console.log('ScheduleViewer UPDATED', prevProps);
		// this.__redraw_d3();

	}

	render (){
		return (
			<Row>
				<Col xs={12} md={9}>
					<div ref="graph"></div>
					<div className="text-center">
						<ButtonGroup>
							<Button onClick={(evt)=>this.d3.panLeft(this)}>
								<i className="fa fa-chevron-left"/>
							</Button>
							<Button onClick={(evt)=>this.d3.zoomOut(this)}>
								<i className="fa fa-search-minus"/>
							</Button>
							<Button onClick={(evt)=>this.d3.resetView(this)}>
								<i className="fa fa-refresh"/>
							</Button>
							<Button onClick={(evt)=>this.d3.zoomIn(this)}>
								<i className="fa fa-search-plus"/>
							</Button>
							<Button onClick={(evt)=>this.d3.panRight(this)}>
								<i className="fa fa-chevron-right"/>
							</Button>
						</ButtonGroup>
					</div>
				</Col>

				<Col xs={12} md={3}>
					<ApplicationCtrl dash={this.props.dash}/>
					<Tabs id="system-event-tabs">
						<Tab title="Scheduler" eventKey={1}>
							<div style={{ maxHeight: 400+'px', overflow: 'auto' }}>
								<Table striped bordered condensed>
									<thead>
										<tr>
											<th>Time</th>
											<th>Event</th>
										</tr>
									</thead>
									<tbody>
									{
										this.state.scheduler_events.map((event, index)=>{
											return (
												<tr key={index}>
													<td>{d3.timeFormat('%H:%M:%S.%L')(event.timestamp)}</td>
													<td>{event.data.phase}</td>
												</tr>
											)
										})
									}
									</tbody>
								</Table>
							</div>
						</Tab>

						<Tab title="Engines" eventKey={2}>
							<div style={{ maxHeight: 400+'px', overflow: 'auto' }}>
								<Table striped bordered condensed>
									<thead>
										<tr>
											<th>Time</th>
											<th>Engine</th>
											<th>Event</th>
										</tr>
									</thead>
									<tbody>
									{
										this.state.engine_events.map((event, index)=>{
											return (
												<tr key={index}>
													<td>{d3.timeFormat('%H:%M:%S.%L')(event.timestamp)}</td>
													<td>
														<EngineQuickCtrl dash={this.props.dash} engine={this.props.engines[event.data.engine]}/>
														{event.data.engine}
													</td>
													<td>{event.data.status}</td>
												</tr>
											)
										})
									}
									</tbody>
								</Table>
							</div>
						</Tab>

						<Tab title="Programs" eventKey={3}>
							<div style={{ maxHeight: 400+'px', overflow: 'auto' }}>
								<Table striped bordered condensed>
									<thead>
										<tr>
											<th>Time</th>
											<th>Program</th>
											<th>Event</th>
										</tr>
									</thead>
									<tbody>
									{
										this.state.program_events.map((event, index)=>{
											return (
												<tr key={index}>
													<td>{d3.timeFormat('%H:%M:%S.%L')(event.timestamp)}</td>
													<td>{event.data.code_name} {event.data.instance_id}</td>
													<td>{event.data.status}</td>
												</tr>
											)
										})
									}
									</tbody>
								</Table>
							</div>
						</Tab>
					</Tabs>
				</Col>
			</Row>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines,
		programs: state.dashboard.programs,
		history: state.dashboard.history
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleViewer);