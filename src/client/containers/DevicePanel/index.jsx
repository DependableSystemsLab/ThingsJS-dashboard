import React from 'react';
import {connect} from 'react-redux';
import {Panel, Form, FormControl, ListGroup, ListGroupItem, ButtonGroup, Button, OverlayTrigger, Tooltip, Dropdown, Row, Col, Table, Image, Badge, Modal} from 'react-bootstrap';

import ProgramButtonGroup from '../ProgramButtonGroup/';
import DeviceGraph from '../DeviceGraph/';
import DeviceConsole from '../DeviceConsole/';
import StreamViewer from '../../components/StreamViewer/';

import style from './style.css';

const DISPLAY_ORDER = ['Running', 'Paused', 'Exited'];

const ICON_MAP = {
	'image/png': 'image',
	'image/jpeg': 'image',
	'application/json': 'file',
	'text/plain': 'file-alt',
	'text/html': 'file-code',
}

function OutputList(props){
	if (!props.program.meta.outputs) return (<p>No Output Stream</p>)
	return (
		<ListGroup>
			{
				Object.keys(props.program.meta.outputs)
					.map((topic)=>{
						var outputType = props.program.meta.outputs[topic];
						var icon;
						if (outputType in ICON_MAP){
							icon = 'fa fa-'+ICON_MAP[outputType];
						}
						else {
							icon = 'fa fa-question';
						}

						return (
							<OverlayTrigger key={topic} placement="left" overlay={<Tooltip id={"tooltip-output-"+topic}>{outputType}</Tooltip>}>
								<ListGroupItem onClick={(e)=>props.onClickOutput(props.program, outputType, topic)}>
									<i className={icon}/> {topic}
								</ListGroupItem>
							</OverlayTrigger> 
						)
					})
			}
		</ListGroup>
	)
}

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
												<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-outputs">Show Outputs</Tooltip>}>
													<Dropdown id="dropdown-program-outputs">
														<Dropdown.Toggle bsStyle="default" bsSize="small" noCaret>
															<i className="fa fa-file-export"/>
														</Dropdown.Toggle>
														<Dropdown.Menu>
															<OutputList program={props.programs[instance_id]} onClickOutput={props.panel.showProgramOutput.bind(props.panel)}/>
														</Dropdown.Menu>
													</Dropdown>
												</OverlayTrigger>
												<strong>{instance_id}</strong>
												{code[instance_id]}
												{
													code[instance_id] !== 'Exited' ?
													<ProgramButtonGroup program={props.programs[instance_id]}/>
													: null
												}
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

class DeviceOutput extends React.Component{
	constructor(props){
		super();

		this.$dash = props.panel.$dash;
		this.state = {
			topic: props.selected_stream.topic,
			mimeType: props.selected_stream.mimeType
		}
	}

	setStream(topic, mimeType){
		this.setState({
			topic: topic,
			mimeType: mimeType
		})
	}

	render(){
		var outputs = (
			<ListGroup>
			{
				Object.keys(this.props.programs).map((instance_id)=>{
					var prog = this.props.programs[instance_id];
					var topics = (prog.meta.outputs) ? Object.keys(prog.meta.outputs) : [];
					if (prog.status != 'Exited' && topics.length > 0){
						return (
							<ListGroupItem key={instance_id}>
								<p>{prog.code_name} - {instance_id}</p>
								{
									topics.map((topic)=>{
										var outputType = prog.meta.outputs[topic];
										var icon = (outputType in ICON_MAP) ? ('fa fa-'+ICON_MAP[outputType]) : 'fa fa-question';
										
										return (
											<p key={instance_id+'/'+topic} className={(this.state.topic == topic) ? 'bg-success' : ''}>
												<a onClick={()=>this.setStream(topic, outputType)}>
													<i className={icon}/> {topic}
												</a>
											</p>
										)
									})
								}
							</ListGroupItem>
						)
					}
					else return null;
				})
			}
			</ListGroup>
		)

		return (
			<Row>
				<Col xs={12} md={8}>
					<StreamViewer
						pubsub={this.$dash.pubsub} 
						topic={this.state.topic}
						mimeType={this.state.mimeType}/>
				</Col>
				<Col xs={12} md={4}>
					{outputs}
				</Col>
			</Row>
		)
	}
}

class DevicePanel extends React.Component {
	constructor(props){
		super();
		// console.log("DevicePanel Created", props);

		this.$dash = props.dash;

		this.state = {
			view_mode: 'info',
			selected_code: null,
			selected_program: null,
			selected_stream: {
				topic: '',
				mimeType: ''
			},
			engine: null,
			codes: {},
			output_modal: {
				show: false,
				topic: '',
				mimeType: 'text/plain'
			}
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
					codes: fsObject.content
				});

			});
		this.handlerID = this.$dash.on('engine-registry-event', (engine)=>{
			// console.log('Engine status changed!', engine);
		})
	}
	
	componentWillUnmount(){
		this.$dash.removeHandler('engine-registry-event', this.handlerID);
	}

	componentDidUpdate(prevProps){
		// console.log("DevicePanel Updated", this.props, this.state);
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

	showProgramOutput(program, mimeType, topic){
		this.setState({
			view_mode: 'outputs',
			selected_stream: {
				topic: topic,
				mimeType: mimeType
			}
		});

		// this.setState({
		// 	output_modal: {
		// 		show: true,
		// 		topic: topic,
		// 		mimeType: mimeType
		// 	}
		// })
	}
	hideOutputModal(){
		this.setState({
			output_modal: {
				show: false,
				topic: '',
				mimeType: ''
			}
		})
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
				// console.log('Successfully launched code', result);
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
			else if (this.state.view_mode === 'outputs'){
				panelBody = <DeviceOutput programs={this.props.programs} panel={this} selected_stream={this.state.selected_stream}/>
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
						<Button onClick={(e)=>this.setViewMode('outputs')}>Output</Button>
					</ButtonGroup>
				</Panel.Heading>
				<Panel.Body>
					{panelBody}
				</Panel.Body>
				<Panel.Footer>
					{panelFooter}
				</Panel.Footer>
				<Modal show={this.state.output_modal.show} onHide={(e)=>this.hideOutputModal()}>
					<Modal.Header closeButton>
						<Modal.Title>{}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<StreamViewer pubsub={this.$dash.pubsub} topic={this.state.output_modal.topic} mimeType={this.state.output_modal.mimeType}/>
					</Modal.Body>
				</Modal>
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