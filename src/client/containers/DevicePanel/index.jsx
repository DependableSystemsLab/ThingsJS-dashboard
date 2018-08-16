import React from 'react';
import {connect} from 'react-redux';
import {Panel, Form, FormControl, ListGroup, ListGroupItem, ButtonGroup, Button, OverlayTrigger, Tooltip, Row, Col, Table, Image, Badge} from 'react-bootstrap';

import ProgramButtonGroup from '../ProgramButtonGroup/';
import DeviceGraph from '../DeviceGraph/';
import DeviceConsole from '../DeviceConsole/';

import style from './style.css';

const DISPLAY_ORDER = ['Running', 'Paused', 'Exited'];

function DeviceInfo(props){
	return (
		<Row>
			<Col xs={12} md={5}>
				<h4>Engine <strong>{props.engine.id}</strong></h4>
				<Table bordered condensed>
					<tbody>
						<tr>
							<th>Engine ID</th>
							<td>{props.engine.id}</td>
						</tr>
						<tr>
							<th>Device</th>
							<td>{props.engine.meta.device}</td>
						</tr>
						<tr>
							<th>Status</th>
							<td>{props.engine.status}</td>
						</tr>
					</tbody>
				</Table>
			</Col>
			<Col xs={12} md={7}>
				<h4>Processes</h4>
				<ListGroup componentClass="div">
					{
					Object.keys(props.engine.codes).map((code_name, index)=>{
						var code = props.engine.codes[code_name];
						return (
							<div key={index} className="list-group-item">
								<h4>{code_name}</h4>
								{
									Object.keys(code)
										.sort((a, b)=>( ( DISPLAY_ORDER.indexOf(code[a]) - DISPLAY_ORDER.indexOf(code[b]) )
														|| (a < b ? -1 : (a > b ? 1 : 0)) ) )	// Lambda compareFunction (first order by status then by id)
										.map((instance_id, j)=>{

										return (
											<div key={j}
												className={('program-status-'+code[instance_id].toLowerCase())}>
												<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-console">Show Console</Tooltip>}>
													<Button bsStyle="default" bsSize="small"
													 	onClick={(e)=>props.panel.setViewMode('console', { selected_program: instance_id })}>
														<i className="fa fa-eye"/>
													</Button>
												</OverlayTrigger>
												<strong>{instance_id}</strong>
												{code[instance_id]}
												<ProgramButtonGroup program={props.programs[instance_id]}/>
											</div>
										)
									})
								}
							</div>
						)
					})
					}
				</ListGroup>
			</Col>
		</Row>
	)
}

class DevicePanel extends React.Component {
	constructor(props){
		super();
		console.log("DevicePanel Created", props);

		this.$dash = props.dash;

		this.state = {
			view_mode: 'info',
			selected_code: null,
			selected_program: null,
			engine: null,
			codes: {}
		}
		if (props.engine){
			this.state.engine = props.engines[props.engine]
		}
	}

	componentDidMount(){
		this.$dash.fs.get('/codes/')
			.then((fsObject)=>{

				// console.log(fsObject);
				this.setState({
					codes: fsObject.children
				});

			});
		this.handlerID = this.$dash.on('engine-registry-event', (engine)=>{
			console.log('Engine status changed!', engine);
		})
	}
	
	componentWillUnmount(){
		this.$dash.removeHandler('engine-registry-event', this.handlerID);
	}

	componentDidUpdate(prevProps){
		console.log("DevicePanel Updated", this.props, this.state);
		if (this.props.engine !== prevProps.engine){
			this.setState({
				engine: this.props.engines[this.props.engine]
			})
		}
	}

	setViewMode(mode, other_data){
		this.setState(Object.assign({
			view_mode: mode,
		}, other_data));
	}

	selectEngine(engine_id){
		this.setState({
			engine: (engine_id ? this.props.engines[engine_id] : null)
		});
	}
	selectCode(code_name){
		this.setState({
			selected_code: code_name
		});
	}
	runCode(){
		this.state.engine.runCode(this.state.selected_code, this.state.codes[this.state.selected_code].content)
			.then(function(result){
				console.log('Successfully launched code', result);
			})
	}
	pauseCode(instance_id){
		this.$dash.programs[instance_id].pause()
	}
	resumeCode(instance_id){
		this.$dash.programs[instance_id].resume()
	}
	killCode(instance_id){
		this.$dash.programs[instance_id].kill()
	}

	render(){
		var panelBody;
		if (this.state.engine){
			var ctrl = {
				pause: this.pauseCode.bind(this),
				resume: this.resumeCode.bind(this),
				kill: this.killCode.bind(this)
			}
			if (this.state.view_mode === 'info'){
				panelBody = <DeviceInfo engine={this.state.engine} programs={this.props.programs} panel={this}/>
			}
			else if (this.state.view_mode === 'graph'){
				panelBody = <DeviceGraph engine={this.state.engine} width={'100%'} height={'180px'}/>
			}
			else if (this.state.view_mode === 'console'){
				panelBody = <DeviceConsole engine={this.state.engine} instance_id={this.state.selected_program} ctrl={ctrl} dash={this.$dash}/>
			}
			else {
				panelBody = <p>Unknown Mode</p>
			}
		}
		else {
			panelBody = (<p>No Engine Selected</p>)
		}

		var panelFooter;
		if (this.state.engine){
			panelFooter = (
				<Form inline>
					<FormControl onChange={(e)=>this.selectCode(e.target.value)} componentClass="select" placeholder="Select Code">
						<option value={null}> --- Select Code --- </option>
						{
							Object.keys(this.state.codes).map((key, index)=>{
								return <option key={index} value={key}>{key}</option>
							})
						}
					</FormControl>
					<Button onClick={(e)=>this.runCode()} bsStyle="success">
						<i className="fa fa-play"></i> Run
					</Button>
				</Form>
			)
		}
		else {
			panelFooter = null;
		}


		return (
			<Panel>
				<Panel.Heading>
					<Form inline>
						<FormControl onChange={(evt)=>this.selectEngine(evt.target.value)}
							componentClass="select"
							value={this.state.engine ? this.state.engine.id : ''}
							placeholder="Select Engine">
							<option value={''}>--- Select Engine ---</option>
							{
								Object.keys(this.props.engines).map((key)=>{
									return <option key={key} value={key}>{key}</option>
								})
							}
						</FormControl>
					</Form>
					<ButtonGroup>
						<Button onClick={(e)=>this.setViewMode('info')}>Info</Button>
						<Button onClick={(e)=>this.setViewMode('graph')}>Graph</Button>
						<Button onClick={(e)=>this.setViewMode('console')}>Console</Button>
					</ButtonGroup>
				</Panel.Heading>
				<Panel.Body>
					{panelBody}
				</Panel.Body>
				<Panel.Footer>
					{panelFooter}
				</Panel.Footer>
			</Panel>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines,
		programs: state.dashboard.programs,
		files: state.dashboard.files
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DevicePanel);