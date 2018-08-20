import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import ScheduleViewer from '../containers/ScheduleViewer/';

export default class Schedule extends React.Component {
	render(){
		return (
			<Row>
			    <Col xs={12} md={12}>
			    	<ScheduleViewer dash={this.props.dash} width={'100%'}/>
			    </Col>
			</Row>
		)
	}
}