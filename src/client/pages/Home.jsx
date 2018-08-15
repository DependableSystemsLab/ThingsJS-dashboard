import React from 'react';
import { Grid, Row, Col, Popover, ListGroup, ListGroupItem } from 'react-bootstrap';

import DeviceList from '../containers/DeviceList/';
import DevicePanel from '../containers/DevicePanel/';

export default class Home extends React.Component {
	constructor(){
		super();
		this.state = {
			top: '',
			bottom: ''
		}
	}

	showTop(engine_id){
		this.setState({
			top: engine_id
		})
	}

	showBottom(engine_id){
		this.setState({
			bottom: engine_id
		})
	}

	DeviceMenu(props){
		return (
			<Popover id="popover-device-menu" title={props.engine.id}>
				<ListGroup>
					<ListGroupItem onClick={(e)=>this.showTop(props.engine.id)}>
						Show on Top Pane
					</ListGroupItem>
					<ListGroupItem onClick={(e)=>this.showBottom(props.engine.id)}>
						Show on Bottom Pane
					</ListGroupItem>
				</ListGroup>
			</Popover>
		)
	}

	render(){
		return (
			<Row>
			    <Col xs={12} md={4}>
			      <h4>Devices</h4>
			      <DeviceList menuFunc={this.DeviceMenu.bind(this)} ></DeviceList>
			    </Col>
			    <Col xs={12} md={8}>
			    	<DevicePanel dash={this.props.dash} engine={this.state.top}></DevicePanel>
			    	<DevicePanel dash={this.props.dash} engine={this.state.bottom}></DevicePanel>
			    </Col>
			</Row>
		)
	}
}