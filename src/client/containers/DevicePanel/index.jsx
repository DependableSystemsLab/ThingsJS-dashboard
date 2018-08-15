import React from 'react';
import {connect} from 'react-redux';
import {Panel, Form, FormControl, ButtonGroup, Button, Row, Col, Table, Image, Badge} from 'react-bootstrap';

import DeviceGraph from '../DeviceGraph/';
import DeviceConsole from '../DeviceConsole/';

function DeviceInfo(props){
	return (
		<Row>
			<Col xs={12} md={6}>
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
			<Col xs={12} md={6}>
				<h4>Processes</h4>
			</Col>
		</Row>
	)
}

class DevicePanel extends React.Component {
	constructor(props){
		super();

		this.$dash = props.dash;

		this.state = {
			view_mode: 'info',
			selected_code: null,
			engine: null,
			codes: {}
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

	render(){
		var panelBody;
		if (this.state.engine){
			if (this.state.view_mode === 'info'){
				panelBody = <DeviceInfo engine={this.state.engine}/>
			}
			else if (this.state.view_mode === 'graph'){
				panelBody = <DeviceGraph engine={this.state.engine} width={'100%'} height={'180px'}/>
			}
			else if (this.state.view_mode === 'console'){
				panelBody = <DeviceConsole lines={this.state.engine.console}/>
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
						<FormControl onChange={(evt)=>this.selectEngine(evt.target.value)} componentClass="select" placeholder="Select Engine">
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
		files: state.dashboard.files
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DevicePanel);