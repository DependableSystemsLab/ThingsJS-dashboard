import React from 'react';
import {connect} from 'react-redux';
import {Row, Col} from 'react-bootstrap';
import * as d3 from 'd3';

import style from './style.css';

class ScheduleViewer extends React.Component {
	constructor (props){
		super();
		this.$dash = props.dash;
		this.d3 = {};
	}

	__init_d3 (){
		var svg = d3.select(this.refs.graph).append('svg')
			.attr('width', (this.props.width || '600px') )
			.attr('height', (this.props.height || '400px') );

		var elemBox = svg.node().getBoundingClientRect();

		var margin = { left: 50, right: 30, top: 30, bottom: 50 };
		var size = { width: elemBox.width - margin.left - margin.right, height: elemBox.height - margin.top - margin.bottom };

		this.d3.svg = svg;
		this.d3.elemBox = elemBox;
		this.d3.margin = margin;
		this.d3.size = size;
	}

	render (){
		return (
			<Row>
				<Col xs={12} md={9}>
					<div ref="graph"></div>
				</Col>
			</Row>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines,
		programs: state.dashboard.programs,
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleViewer);