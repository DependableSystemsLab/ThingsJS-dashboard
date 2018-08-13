import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import ApplicationBuilder from '../containers/ApplicationBuilder/';

export default class Applications extends React.Component {
	render(){
		return (
			<Row>
			    <Col xs={12} md={12}>
			    	<ApplicationBuilder dash={this.props.dash}></ApplicationBuilder>
			    </Col>
			</Row>
		)
	}
}