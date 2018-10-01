import React from 'react';
// import {connect} from 'react-redux';
import {ListGroup, ListGroupItem, ButtonGroup, Button, Dropdown, Form, FormControl, OverlayTrigger, Tooltip, Row, Col} from 'react-bootstrap';

class ApplicationCtrl extends React.Component {
	constructor (props){
		super();
		console.log(props);
		this.$dash = props.dash

		this.state = {
			available_apps: {},
			selected_app: '',
			apps: this.$dash.apps || {}
		}
	}

	componentDidMount(){
		this.refresh();

		this.handlerID = this.$dash.on('system-state', (sched)=>{
			this.setState({
				apps: sched.apps
			})
		})
	}

	componentWillUnmount(){
		this.$dash.removeHandler('system-state', this.handlerID);
	}

	refresh(){
		this.$dash.fs.get('/apps')
			.then((data)=>{
				var apps = Object.keys(data.children).reduce((acc, key)=>{
					acc[data.children[key]._id] = JSON.parse(data.children[key].content)
					return acc;
				}, {});
				this.setState({
					available_apps: apps
				})
			})
	}

	run(app_id){
		this.$dash.runApplication(this.state.available_apps[app_id])
	}

	pause(token){
		this.$dash.pauseApplication(token)
	}

	resume(token){
		this.$dash.resumeApplication(token)
	}

	kill(token){
		this.$dash.killApplication(token)
	}

	render() {
		return (
			<ListGroup>
				{
					Object.keys(this.state.apps).map((token)=>{
						var app = this.state.apps[token];
						var killBtn = (app.status !== 'Exited') ?
							(<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-app-kill">Kill</Tooltip>}>
								<Button bsStyle="danger" onClick={()=>this.kill(token)}>
									<i className="fa fa-stop"/>
								</Button>
							</OverlayTrigger>) : null;

						var pauseResumeBtn = (app.status === 'Exited') ? null : (
								(app.status === 'Running') ? 
								(<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-app-pause">Pause</Tooltip>}>
									<Button bsStyle="warning" onClick={()=>this.pause(token)}>
										<i className="fa fa-pause"/>
									</Button>
								</OverlayTrigger>)
								: (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-app-resume">Resume</Tooltip>}>
									<Button bsStyle="success" onClick={()=>this.resume(token)}>
										<i className="fa fa-play"/>
									</Button>
								</OverlayTrigger>)
							);

						return (
							<ListGroupItem key={token}>
								<span>{app.name}</span>
								<small>{token}</small>
								<ButtonGroup bsSize="small">
									{killBtn}
									{pauseResumeBtn}
								</ButtonGroup>
							</ListGroupItem>
						)
					})
				}
				<ListGroupItem>
					<Row>
						<Col xs={9} md={9}>
							<FormControl onChange={(evt)=>this.setState({ selected_app: evt.target.value })}
								componentClass="select"
								value={this.state.selected_app || ''}
								placeholder="Select Application">
								<option value={''}>--- Select Application ---</option>
								{
									Object.keys(this.state.available_apps).map((_id)=>{
										return <option key={_id} value={_id}>{this.state.available_apps[_id].name}</option>
									})
								}
							</FormControl>
						</Col>
						<Col xs={3} md={3}>
							<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-app-run">Run</Tooltip>}>
								<Button bsStyle="success" onClick={()=>this.run(this.state.selected_app)}>
									<i className="fa fa-play"/>
								</Button>
							</OverlayTrigger>
						</Col>
					</Row>
				</ListGroupItem>
			</ListGroup>
		)
	}
}

// const mapStateToProps = (state)=>{
// 	return {
// 		engines: state.dashboard.engines,
// 		programs: state.dashboard.programs,
// 		files: state.dashboard.files
// 	}
// }
// const mapDispatchToProps = (dispatch)=>{
// 	return {

// 	}
// }

// export default connect(mapStateToProps, mapDispatchToProps)(ApplicationCtrl);

export default ApplicationCtrl;