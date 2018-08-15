import React from 'react';
import {connect} from 'react-redux';
import {Panel, Form, FormControl, ListGroup, ListGroupItem, ButtonGroup, Button, Row, Col, Table, Image, Badge} from 'react-bootstrap';

import DeviceGraph from '../DeviceGraph/';
import DeviceConsole from '../DeviceConsole/';

import style from './style.css';

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
							<ListGroupItem key={index} header={code_name}>
								{
									Object.keys(code).map((instance_id, j)=>{
										var middleBtn;
										if (code[instance_id] === 'Running'){
											middleBtn = <Button bsStyle="warning"
															onClick={()=>props.ctrl.pause(instance_id)}>
															<i className="fa fa-pause"/>
															Pause
														</Button>
										}
										else {
											middleBtn = <Button bsStyle="success"
															onClick={()=>props.ctrl.resume(instance_id)}>
															<i className="fa fa-play"/>
															Resume
														</Button>
										}

										return (
											<span key={j}
												className={('program-status-'+code[instance_id].toLowerCase())}>
												<strong>{instance_id}</strong>
												{code[instance_id]}
												<ButtonGroup bsSize="small" className="pull-right">
													<Button bsStyle="danger"
														onClick={()=>props.ctrl.kill(instance_id)}>
														<i className="fa fa-stop"/>
														Kill
													</Button>
													{middleBtn}
													<Button bsStyle="info"
														onClick={()=>props.ctrl.kill(instance_id)}>
														<i className="fa fa-exchange"/>
														Migrate
													</Button>
												</ButtonGroup>
											</span>
										)
									})
								}
							</ListGroupItem>
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

				console.log(fsObject);
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

	setViewMode(mode){
		this.setState({
			view_mode: mode
		});
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
				kill: this.resumeCode.bind(this)
			}
			if (this.state.view_mode === 'info'){
				panelBody = <DeviceInfo engine={this.state.engine} ctrl={ctrl}/>
			}
			else if (this.state.view_mode === 'graph'){
				panelBody = <DeviceGraph engine={this.state.engine} width={'100%'} height={'180px'}/>
			}
			else if (this.state.view_mode === 'console'){
				panelBody = <DeviceConsole engine={this.state.engine} ctrl={ctrl} dash={this.$dash}/>
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
							value={this.state.engine ? this.state.engine.id : null}
							placeholder="Select Engine">
							<option value={null}>--- Select Engine ---</option>
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