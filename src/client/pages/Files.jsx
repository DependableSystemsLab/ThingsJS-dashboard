import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import FileSystemViewer from '../containers/FileSystemViewer/';

export default class Files extends React.Component {
	render(){
		console.log('Files Component', this.props);
		return (
			<Row>
			    <Col xs={12} md={12}>
			    	<FileSystemViewer dash={this.props.dash}></FileSystemViewer>
			    </Col>
			</Row>
		)
	}
}