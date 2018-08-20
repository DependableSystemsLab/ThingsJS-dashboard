import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, Breadcrumb, Panel, Form, FormGroup, ControlLabel, FormControl, Table,
		ButtonGroup, Button, ListGroup, FieldGroup, PanelGroup, InputGroup, ListGroupItem, Image, Badge} from 'react-bootstrap';

import {randKey} from '../../libs/things.js';

import AceEditor from 'react-ace';

import styles from './styles.css';

class ApplicationBuilder extends React.Component {
	constructor(props){
		super();

		this.$dash = props.dash;

		this.state = {
			app_path: '/Applications/Prototype',
			cur_path: '/',
			cur_path_tokens: [],
			cur_dir: props.root,
			cur_app: {
				name: '',
				components: {}
			},
			existing_apps: {}
		}

		this.createAppFolder.bind(this)();
	}

	createAppFolder(){
		this.$dash.fs.makeDir('/', 'Applications')
			.then((res)=>{
				this.$dash.fs.makeDir('/Applications', 'Prototype')
					.then((res)=>{
						this.refresh();
						this.fetchApps();
					})
					.catch((e)=>{
						this.refresh();
						this.fetchApps();
					})
			})
			.catch((err)=>{
				this.$dash.fs.makeDir('/Applications', 'Prototype')
					.then((res)=>{
						this.refresh();
						this.fetchApps();
					})
					.catch((e)=>{
						this.refresh();
						this.fetchApps();
					})
			})
	}

	fetchApps(){
		this.$dash.fs.get(this.state.app_path)
			.then((apps)=>{
				this.setState({
					existing_apps: apps.children 
				})
			})
	}

	refresh(){
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
		app['components'][code._id] = {
			name: code.name, 
			source: code.content, 
			count: 1, 
			required_memory: 1,
			component_id: code._id
		}
		this.setState({ cur_app: app });
	}

	updateComponent(event, componentId, field){
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		app['components'][componentId][field] = Number(event.target.value);
		this.setState({ cur_app: app });
	}

	removeComponent(componentId){
		console.log('Deleting component ' + componentId);
		var app = JSON.parse(JSON.stringify(this.state.cur_app));
		delete app['components'][componentId];
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
			console.log('Application missing details');
			return;
		}
		// var file = {
		// 	name: this.state.cur_app.name,
		// 	content: JSON.stringify(Object.values(this.state.cur_app.components))
		// }
		var file = {
			name: randKey(),
			content: JSON.stringify({ 
				name: this.state.cur_app.name, 
				components: Object.values(this.state.cur_app.components)
			})
		}
		this.$dash.fs.writeFile(this.state.app_path, file)
			.then((file)=>{
				console.log('Application saved');
				this.setState({ cur_app: { name: '', components: {} }});
				this.fetchApps();
			})
			.catch((e)=>{
				this.setState({ cur_app: { name: '', components: {} }});
			})
	}

	deleteApplication(id){
		console.log('Deleting application ' + id);
		this.$dash.fs.delete(this.state.cur_path, [id])
			.then((res)=>{
				this.refresh();
				this.fetchApps();
			})
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
				var codeObject = this.state.cur_dir.children[name];
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
						<ControlLabel>{obj.name}</ControlLabel>

						<InputGroup>
							<InputGroup.Addon>count</InputGroup.Addon>
							<FormControl type="number" min="1" defaultValue="1"
								onChange={(e)=>this.updateComponent.bind(this)(e, obj.component_id, "count")}/>
						</InputGroup>

						<InputGroup>
							<InputGroup.Addon>required memory</InputGroup.Addon>
							<FormControl type="number" min="1" defaultValue="1"
								onChange={(e)=>this.updateComponent.bind(this)(e, obj.component_id, "required_memory")}/>
							<InputGroup.Addon>bytes</InputGroup.Addon>
						</InputGroup>
						{/* button is nested in ListGroupItem only for styling purposes */}
						<ListGroupItem>
							<Button bsStyle="danger" onClick={(e)=>this.removeComponent.bind(this)(obj.component_id)}>
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
			curApps = (Object.values(this.state.existing_apps)).map((obj, index)=>{
				// render the components for each application
				var comps = Object.values(JSON.parse(obj.content).components).map((comp, compIndex)=>{
					var fields = Object.keys(comp).map((field, i)=>{
						return (
							<th key={i}>{field}</th>
						)
					})
					var fieldValues = Object.values(comp).map((val, k)=>{
						return (
							<td key={k}>{val}</td>
						)
					})

					return (
						<Table key={compIndex} striped bordered condensed hover>
							<thead><tr>{fields}</tr></thead>
							<tbody><tr>{fieldValues}</tr></tbody>
						</Table>
					)
				})

				return (
					<Panel bsStyle="info" key={index} eventKey={String(index)}>
						<Panel.Heading>
							<Button bsStyle="danger" bsSize="xsmall" className="pull-right" onClick={(e)=>this.deleteApplication.bind(this)(obj._id)}>
								<i className="fa fa-trash"/> Delete
							</Button>
							<Panel.Title componentClass="h3" className="text-center" toggle>
								{JSON.parse(obj.content).name}
							</Panel.Title>
						</Panel.Heading>
						<Panel.Body collapsible>
							{comps}
							<ButtonGroup vertical block>
								<Button bsStyle="success">
									<i className="fa fa-calendar"/> Schedule
								</Button>
							</ButtonGroup>
						</Panel.Body>
					</Panel>
				)
			})
		}

		return (
			<PanelGroup id="application_builder">
				{/* create new application */}
				<Panel bsStyle="primary">
					<Panel.Heading>
						<Panel.Title componentClass="h2">New application</Panel.Title>
					</Panel.Heading>
					<Panel.Body>
						<Form horizontal>
							<FormGroup>
								<Col xs={12} md={12}>
									<ControlLabel>Application name</ControlLabel>
									<FormControl 
										type="text" 
										placeholder="Application name"
										onChange={this.setApplicationName.bind(this)}>
									</FormControl>
								</Col>
							</FormGroup>

							<FormGroup>
								{/* component selector */}
								<Col xs={12} md={4}>
									<ControlLabel>Available components</ControlLabel>
									<Panel>
										<Panel.Heading>
											<Button bsSize="xsmall" onClick={this.refresh.bind(this)}>
												<i className="fa fa-refresh"/> Directory
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
								</Col>
								{/* requirement selector */}
								<Col xs={12} md={8}>
									<ControlLabel>Component requirements</ControlLabel>
									<ListGroup className="Scroll">{curComponents}</ListGroup>
								</Col>
							</FormGroup>

							<FormGroup>
								{/* submit */}
								<Button bsStyle="primary" className="center-block" onClick={this.createApplication.bind(this)}> 
									<i className="fa fa-save"/> Save application
								</Button>
							</FormGroup>
						</Form>
					</Panel.Body>
				</Panel>
				{/* view existing applications */}
				<Panel bsStyle="primary">
					<Panel.Heading>
						<Panel.Title componentClass="h2">Existing applications</Panel.Title>
					</Panel.Heading>
					<Panel.Body>
						<PanelGroup accordian="true" id="existing_apps">
							{curApps}
						</PanelGroup>
					</Panel.Body>
				</Panel>
			</PanelGroup>
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