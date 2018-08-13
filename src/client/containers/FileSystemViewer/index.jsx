import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, Breadcrumb, Panel, Form, FormGroup, ControlLabel, FormControl,
		ButtonGroup, Button, ListGroup, ListGroupItem, Image, Badge} from 'react-bootstrap';

import AceEditor from 'react-ace';

class FileSystemViewer extends React.Component {
	constructor(props){
		super();

		console.log("FileSystemViewer Component", props);
		this.$dash = props.dash;

		this.state = {
			cur_path: '/',
			cur_path_tokens: [],
			cur_dir: props.root,
			cur_file: {
	            name: '',
	            content: ''
	        },
			cur_selection: {},
			mkdir_name: ''
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
        this.clearAll();
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

	makeDir(dir_name) {
        this.$dash.fs.makeDir(this.state.cur_path, this.state.mkdir_name)
            .then((dir)=>{
                console.log("directory saved", dir);
                this.refresh();
            });
    }
    saveFile() {
        this.$dash.fs.writeFile(this.state.cur_path, this.state.cur_file)
            .then((file)=>{
                console.log("file saved", file);
                // this.cur_code._id = file._id;
                this.setState({
                	cur_file: {
                		_id: file._id
                	}
                })
                this.refresh();
            });
    }

	clearAll() {
		this.setState({
			cur_file: {
				name: '',
            	content: ''	
			},
			cur_selection: {}
		})
    }

    selectCode(code) {
        self.cur_code._id = code._id;
        self.cur_code.name = code.name;
        self.cur_code.content = code.content;
    }

    updateFile(event){
    	this.setState({ cur_file: { name: event.target.value } });
    	console.log(this.state);
    }

    updateDirName(event){
    	this.setState({ mkdir_name: event.target.value });
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
					<Breadcrumb>
						<Breadcrumb.Item href="/#/files/"><i className="fa fa-home"></i></Breadcrumb.Item>
						{
							this.state.cur_path_tokens.map((token, index)=>{
								return <Breadcrumb.Item key={index} href="/#/files">{token}</Breadcrumb.Item>
							})
						}
					</Breadcrumb>
					<Form>
						<FormGroup>
							<ControlLabel>Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.cur_file_name}
								onChange={this.updateFile.bind(this)}>
							</FormControl>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Content</ControlLabel>
							<AceEditor></AceEditor>
						</FormGroup>
						<Button onClick={this.saveFile.bind(this)} bsStyle="primary" block>
							Save
						</Button>
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
								<ListGroupItem>
									<FormControl 
										type="text" 
										value={this.state.mkdir_name} 
										onChange={this.updateDirName.bind(this)}>
									</FormControl>
								</ListGroupItem>
							</ListGroup>
							<Button onClick={this.makeDir.bind(this)} bsStyle="primary" block>
								Add Directory
							</Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(FileSystemViewer);