import React from 'react';
import {connect} from 'react-redux';
import {ListGroup, ListGroupItem, ButtonGroup, Button, Well, OverlayTrigger, Tooltip, Row, Col, Image} from 'react-bootstrap';

import StreamViewer from '../../components/StreamViewer/';

const ICON_MAP = {
	'image/png': 'image',
	'image/jpeg': 'image',
	'application/json': 'file',
	'text/plain': 'file-alt',
	'text/html': 'file-code',
}

class OutputViewer extends React.Component{
	constructor(props){
		super();

		this.$dash = props.dash;
		this.state = {
			topic: props.topic,
			mimeType: props.mimeType
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
			<Well bsSize="small">
				<h4>Stream Viewer</h4>
				<Row>
					<Col xs={12} md={12}>
						<StreamViewer
							pubsub={this.$dash.pubsub}
							topic={this.state.topic}
							mimeType={this.state.mimeType}/>
					</Col>
					<Col xs={12} md={12}>
						{outputs}
					</Col>
				</Row>
			</Well>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		programs: state.dashboard.programs
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(OutputViewer);