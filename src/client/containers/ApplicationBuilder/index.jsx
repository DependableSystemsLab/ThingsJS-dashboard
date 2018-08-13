import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, Breadcrumb, Panel, Form, FormGroup, ControlLabel, FormControl,
		ButtonGroup, Button, ListGroup, ListGroupItem, Image, Badge} from 'react-bootstrap';

import AceEditor from 'react-ace';

class ApplicationBuilder extends React.Component {
	constructor(props){
		super();

		this.$dash = props.dash;

		this.state = {
			cur_path: '/',
			cur_path_tokens: [],
			cur_dir: props.root,
			cur_app: {
				name: '',
				components: {}
			}
		}

	}

	refresh() {
        this.$dash.fs.get(this.state.cur_path)
            .then((fsObject)=>{
                console.log(fsObject);
                this.setState({
                	cur_dir: fsObject,
                	cur_path_tokens: this.state.cur_path.split('/').slice(1)
                })
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
				return (<ListGroupItem key={index}><i className="fa fa-file"/> {name}</ListGroupItem>)
			})	
		}
		else {
			curFiles = (<ListGroupItem> - Empty - </ListGroupItem>)
		}

		return (
			<Row>
				<Col xs={12} md={8}>
					<Form>
						<FormGroup>
							<ControlLabel>Name</ControlLabel>
							<FormControl type="text"></FormControl>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Definition</ControlLabel>
						</FormGroup>
					</Form>
				</Col>
				<Col xs={12} md={4}>
					<Panel>
						<Panel.Heading>
							<Button onClick={this.refresh.bind(this)}>
								<i className="fa fa-refresh"/>
							</Button>
							Directory
						</Panel.Heading>
						<Panel.Body>
							<Breadcrumb>
								<Breadcrumb.Item href="/#/files/"><i className="fa fa-home"></i></Breadcrumb.Item>
								{
									this.state.cur_path_tokens.map((token, index)=>{
										return <Breadcrumb.Item key={index} href="/#/files">{token}</Breadcrumb.Item>
									})
								}
							</Breadcrumb>
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