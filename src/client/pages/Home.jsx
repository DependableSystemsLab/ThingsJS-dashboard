import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import DeviceList from '../containers/DeviceList/';
import DevicePanel from '../containers/DevicePanel/';

export default class Home extends React.Component {
	render(){
		return (
			<Row>
			    <Col xs={12} md={4}>
			      <h4>Devices</h4>
			      <DeviceList></DeviceList>
			    </Col>
			    <Col xs={12} md={8}>
			    	<DevicePanel></DevicePanel>
			    </Col>
			</Row>
		)
	}
}