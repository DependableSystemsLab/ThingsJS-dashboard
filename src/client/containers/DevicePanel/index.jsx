import React from 'react';
import {connect} from 'react-redux';
import {Panel, Form, FormControl, ButtonGroup, Button, Row, Col, Table, Image, Badge} from 'react-bootstrap';

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
		this.state = {
			view_mode: 'info',
			engine: null
		}
	}

	selectEngine(engine_id){
		this.setState({
			engine: (engine_id ? this.props.engines[engine_id] : null)
		});
	}

	render(){
		var panelBody;
		if (this.state.engine){
			if (this.state.view_mode === 'info'){
				panelBody = <DeviceInfo engine={this.state.engine}/>
			}
			else {
				panelBody = <p>Unknown</p>
			}
		}
		else {
			panelBody = (<p>No Engine Selected</p>)
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
						<Button>Info</Button>
						<Button>Graph</Button>
						<Button>Console</Button>
					</ButtonGroup>
				</Panel.Heading>
				<Panel.Body>
					{panelBody}
				</Panel.Body>
				<Panel.Footer>
					<Form inline>
						<FormControl componentClass="select" placeholder="Select Engine">
							{
								Object.keys(this.props.engines).map((key)=>{
									return <option key={key} value={key}>{key}</option>
								})
							}
						</FormControl>
					</Form>
					<Button bsStyle="success">
						<i className="fa fa-play"></i> Run
					</Button>
				</Panel.Footer>
			</Panel>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DevicePanel);