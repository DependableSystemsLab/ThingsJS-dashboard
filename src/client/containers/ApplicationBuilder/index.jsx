import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, Breadcrumb, Panel, Form, FormGroup, ControlLabel, FormControl, Table, Alert, 
		ButtonGroup, Button, ListGroup, FieldGroup, PanelGroup, InputGroup, ListGroupItem, Image, Badge} from 'react-bootstrap';
import AceEditor from 'react-ace';

import ApplicationCtrl from '../ApplicationCtrl/';
import {randKey} from '../../libs/things.js';
import styles from './styles.css';

class ApplicationBuilder extends React.Component {
	constructor(props){
		super();

		this.$dash = props.dash;

		this.state = {
			scheduler_id: 'things-scheduler',
			scheduling_timeout: 6000,
			app_path: '/apps',
			cur_path: '/codes',
			cur_path_tokens: [],
			cur_dir: props.root,
			cur_app: {
				name: '',
				components: {}
			},
			existing_apps: {},
			alert: {
				text: '',
				show: false
			}
		}

	}

	componentDidMount() {
		this.refreshCodes();
		this.refreshApps();
	}

	refreshApps(){
		this.$dash.fs.get(this.state.app_path)
			.then((data)=>{
				var apps = Object.keys(data.content).reduce((acc, key)=>{
					acc[data.content[key]._id] = JSON.parse(data.content[key].content)
					return acc;
				}, {});
				this.setState({
					existing_apps: apps
				})
			})
	}

	refreshCodes(){
        this.$dash.fs.get(this.state.cur_path)
            .then((fsObject)=>{
                console.log(fsObject);
                this.setState({
                	cur_dir: fsObject,
                	cur_path_tokens: this.state.cur_path.split('/').slice(1)
                })
            })
            .catch((err)=>{
            	console.log('Schedule folder already exists');
            })
    }

	navigateTo(dir_name){
		var to_path;
		if (dir_name === '..') {
            to_path = '/' + this.state.cur_path_tokens.slice(0, -1).join('/');
        } 
        else if (dir_name[0] === '/') {
            to_path = dir_name;
        }
        else if (this.state.cur_path === '/') {
            to_path = this.state.cur_path + dir_name;
        }
        else {
            to_path = this.state.cur_path + '/' + dir_name;
        }
        console.log(to_path, dir_name, this.state.cur_path)
        this.$dash.fs.get(to_path)
            .then((fsObject)=>{
                console.log(fsObject);
                this.setState({
                	cur_path: to_path,
                	cur_path_tokens: to_path.split('/').slice(1),
                	cur_dir: fsObject
                })
            })
        // this.refresh();
	}

	selectComponent(code){
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		app.components[code.name] = {
			code_name: code.name, 
			source: code.content, 
			count: 1, 
			required_memory: 1,
			// component_id: code._id
		}
		this.setState({ cur_app: app });
	}

	updateComponent(event, code_name, field){
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		app.components[code_name][field] = Number(event.target.value);
		this.setState({ cur_app: app });
	}

	removeComponent(code_name){
		console.log('Deleting component ' + code_name);
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		delete app.components[code_name];
		this.setState({ cur_app: app });
	}

	setApplicationName(event){
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		app['name'] = event.target.value;
		this.setState({ cur_app: app });
	}

	createApplication(){

		// TODO form validation 
		if(this.state.cur_app.name === '' || (Object.keys(this.state.cur_app.components).length === 0)){
			// console.log('Application missing details');
			this.setState({ alert: { text: 'Application missing details', show: true } });
			return;
		}
		var file = {
			name: randKey()+'.things',
			content: JSON.stringify(this.state.cur_app)
		}
		this.$dash.fs.writeFile(this.state.app_path, file)
			.then((file)=>{
				console.log('Application saved');
				this.setState({ cur_app: { name: '', components: {} }});
				this.refreshApps();
			})
			.catch((e)=>{
				// this.setState({ cur_app: { name: '', components: {} }});
			})
	}

	scheduleApplication(appDetails){
		var self = this;
		
		var time = new Date();
		var preMsg = 'Request at ' + time.toLocaleString() + ' for ' + appDetails.name;

		this.$dash.runApplication(appDetails)
			.then(function(response){
				self.setState({ alert: { text: preMsg + ' succeeded. Your token is ' + response.token, show: true } });
			})
			.catch(function(error){
				console.log(error);
				self.setState({ alert: { text: preMsg + ' failed.', show: true } });
			})
	}

	pauseApplication(token){
		this.$dash.pauseApplication(token)
	}

	resumeApplication(token){
		this.$dash.resumeApplication(token)
	}

	killApplication(token){
		this.$dash.killApplication(token)
	}

	deleteApplication(id){
		console.log('Deleting application ' + id);
		this.$dash.fs.delete(this.state.cur_path, [id])
			.then((res)=>{
				this.refreshCodes();
				this.refreshApps();
			})
	}

	alertHide(){
		this.setState({ alert: { text: '', show: false } });
	}

	render(){

		var curDirs;
		if (this.state.cur_dir.dirs && this.state.cur_dir.dirs.length > 0){
			curDirs = this.state.cur_dir.dirs.map((name, index)=>{
				return (<ListGroupItem key={index} onClick={(e)=>this.navigateTo(name)}><i className="fa fa-folder"/> {name}</ListGroupItem>)
			})	
		}
		else {
			curDirs = null;
		}

		var curFiles;
		if (this.state.cur_dir.files && this.state.cur_dir.files.length > 0){
			curFiles = this.state.cur_dir.files.map((name, index)=>{
				var codeObject = this.state.cur_dir.content[name];
				return (
				    <InputGroup key={index}>
				      	<InputGroup.Button>
				        	<Button onClick={(e)=>this.selectComponent.bind(this)(codeObject)} bsStyle="success" block>
				        		<i className="fa fa-plus"/>
				        	</Button>
				      	</InputGroup.Button>
				      	<FormControl 
				      		readOnly
				      		type="text"
				      		value={name}
				      	/>
				    </InputGroup>
				)
			})	
		}
		else {
			curFiles = (<ListGroupItem className="text-center"> - Empty - </ListGroupItem>)
		}

		var curComponents;
		if(Object.values(this.state.cur_app.components).length === 0){
			curComponents = (<ListGroupItem className="text-center">- No selected components -</ListGroupItem>)
		}
		else{
			curComponents = Object.values(this.state.cur_app.components).map((obj, index)=>{
				return (
					<ListGroupItem key={index}>
						<ControlLabel>{obj.code_name}</ControlLabel>

						<InputGroup>
							<InputGroup.Addon>count</InputGroup.Addon>
							<FormControl type="number" min="1" defaultValue="1"
								onChange={(e)=>this.updateComponent.bind(this)(e, obj.code_name, "count")}/>
						</InputGroup>

						<InputGroup>
							<InputGroup.Addon>required memory</InputGroup.Addon>
							<FormControl type="number" min="1" defaultValue="1"
								onChange={(e)=>this.updateComponent.bind(this)(e, obj.code_name, "required_memory")}/>
							<InputGroup.Addon>bytes</InputGroup.Addon>
						</InputGroup>
						{/* button is nested in ListGroupItem only for styling purposes */}
						<ListGroupItem>
							<Button bsStyle="danger" onClick={(e)=>this.removeComponent.bind(this)(obj.code_name)}>
								<i className="fa fa-trash"/> Remove
							</Button>
						</ListGroupItem>
					</ListGroupItem>
				)
			})
		}

		var curApps;
		if(Object.values(this.state.existing_apps).length === 0){
			curApps = (<ListGroupItem className="text-center">- No existing applications -</ListGroupItem>)
		}
		else{
			curApps = Object.keys(this.state.existing_apps).map((key, index)=>{
				// render the components for each application
				var app = this.state.existing_apps[key];
				var comps = (
					<Table striped bordered condensed hover>
						<thead><tr><th>Component</th><th>Count</th><th>Memory Required</th></tr></thead>
						<tbody>
						{
							Object.values(app.components).map((comp, compIndex)=>{
								return (
									<tr key={compIndex}>
										<td>{comp.code_name}</td>
										<td>{comp.count}</td>
										<td>{comp.required_memory}</td>
									</tr>
								)
							})
						}
						</tbody>
					</Table>
				)

				return (
					<Panel bsStyle="info" key={key} eventKey={String(index)}>
						<Panel.Heading>
							<Button bsStyle="danger" bsSize="xsmall" className="pull-right" onClick={(e)=>this.deleteApplication.bind(this)(key)}>
								<i className="fa fa-trash"/> Delete
							</Button>
							<Panel.Title componentClass="h3" className="text-center" toggle>
								{app.name}
							</Panel.Title>
						</Panel.Heading>
						<Panel.Body collapsible>
							{comps}
							<ButtonGroup vertical block onClick={(e)=>this.scheduleApplication.bind(this)(app)}>
								<Button bsStyle="success">
									<i className="fa fa-calendar"/> Schedule
								</Button>
							</ButtonGroup>
						</Panel.Body>
					</Panel>
				)
			})
		}

		var appAlert;
		if(this.state.alert.show){
			appAlert = 
				(<Alert bsStyle="warning">
					{this.state.alert.text}
					<Button bsSize="xsmall" className="pull-right" onClick={(e)=>this.alertHide()}>Dismiss</Button>
				</Alert>)
		}
		else{
			appAlert = null;
		}

		return (
			<Row>
			  <Col xs={12} md={8}>
			  	<Panel bsStyle="primary">
					<Panel.Heading>
						<Panel.Title componentClass="h2">New application</Panel.Title>
					</Panel.Heading>
					<Panel.Body>
						<Row>
						  <Col xs={12} md={4}>
						    <FormGroup>
						        <ControlLabel>Available components</ControlLabel>
								<Panel>
									<Panel.Heading>
										<Button bsSize="xsmall" onClick={()=>this.refreshCodes()}>
											<i className="fa fa-sync-alt"/>
										</Button>
										<Button bsSize="xsmall" className="pull-right" onClick={()=>this.navigateTo("/")}>
											<i className="fa fa-home"/> Root
										</Button>
									</Panel.Heading>
									<Panel.Body>
										<ListGroup>
											{
												(this.state.cur_path === '/' ? null: (
													<ListGroupItem onClick={()=>this.navigateTo("..")}>
														<i className="fa fa-folder"/> ..
													</ListGroupItem>)
												)
											}
											{curDirs}
											{curFiles}
										</ListGroup>
									</Panel.Body>
								</Panel>
						    </FormGroup>

						  </Col>

						  <Col xs={12} md={8}>
						  	<Form horizontal>
								<FormGroup>
									<ControlLabel>Application name</ControlLabel>
									<FormControl 
										type="text" 
										placeholder="Application name"
										onChange={this.setApplicationName.bind(this)}>
									</FormControl>
								</FormGroup>

								<FormGroup>
									<ControlLabel>Component requirements</ControlLabel>
									<ListGroup className="Scroll">{curComponents}</ListGroup>
								</FormGroup>

								{appAlert}

								<FormGroup>
									{/* submit */}
									<Button bsStyle="primary" className="center-block" onClick={this.createApplication.bind(this)}> 
										<i className="fa fa-save"/> Save application
									</Button>
								</FormGroup>
							</Form>
						  </Col>
						</Row>
					</Panel.Body>
				</Panel>
			  </Col>

			  <Col xs={12} md={4}>
			  	<Panel bsStyle="primary">
					<Panel.Heading>
						<Panel.Title componentClass="h2">Existing applications</Panel.Title>
					</Panel.Heading>
					<Panel.Body>
						{curApps}
					</Panel.Body>
				</Panel>

				<ApplicationCtrl dash={this.props.dash}/>
			  </Col>
			</Row>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		root: state.dashboard.files
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ApplicationBuilder);
// export default ApplicationBuilder;