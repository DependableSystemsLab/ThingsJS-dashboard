import React from 'react';
import {connect} from 'react-redux';
import {Grid, Row, Col, Breadcrumb, Panel, Form, FormGroup, ControlLabel, FormControl, 
		ButtonGroup, Button, ListGroup, ListGroupItem, InputGroup, Image, Badge} from 'react-bootstrap';

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

	refresh(){
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

	makeDir(dir_name){
		if(this.state.mkdir_name === ''){
			return;
		}
        this.$dash.fs.makeDir(this.state.cur_path, this.state.mkdir_name)
            .then((dir)=>{
                console.log("directory saved", dir);
                this.setState({ mkdir_name: '' });
                this.refresh();
            });
    }

    saveFile(){
    	if(this.state.cur_file.name === ''){
    		return;
    	}
        this.$dash.fs.writeFile(this.state.cur_path, this.state.cur_file)
            .then((file)=>{
                console.log("file saved", file);
                // this.cur_code._id = file._id;
                this.setState({
                	cur_file: Object.assign(this.state.cur_file, {
                		_id: file._id,
                		name: file.name,
                		content: file.content
                	})
                })
                this.refresh();
            });
    }
    loadFile(file_name) {
    	this.setState({
    		cur_file: {
    			_id: this.state.cur_dir.children[file_name]._id,
    			name: this.state.cur_dir.children[file_name].name,
    			content: this.state.cur_dir.children[file_name].content,
    		}
    	})
    }

    deleteSelection(){
    	console.log('trying to delete: ' + Object.keys(this.state.cur_selection));
    	this.$dash.fs.delete(this.state.cur_path, Object.keys(this.state.cur_selection))
    		.then((res)=>{
    			this.refresh();
    		});
    }

	clearAll(){
		this.setState({
			cur_file: {
				name: '',
            	content: ''	
			},
			cur_selection: {}
		})
    }

    selectCode(code){
    	this.setState({
    		cur_file: {
    			_id: code._id,
    			name: code.name,
    			content: code.content
    		}
    	})
    }
	
	updateFileName(event){
    	this.setState({ cur_file: Object.assign(this.state.cur_file, { name: event.target.value }) });
    	console.log(this.state);
    }

    updateFileContent(content){
    	this.setState({ cur_file: Object.assign(this.state.cur_file, { content: content }) });
    	console.log(this.state);
    }

    updateDirName(event){
    	this.setState({ mkdir_name: event.target.value });
    }

    updateSelection(event, code){
    	var selection = Object.assign({}, this.state.cur_selection);
    	if(event.target.checked){
    		selection[code._id] = null;
    		this.setState({ cur_selection: selection });
    	}
    	else{
    		delete selection[code._id];
    		this.setState({ cur_selection: selection });
    	}
    	console.log(this.state);
    }

	render(){
		var curDirs;
		if (this.state.cur_dir.dirs && this.state.cur_dir.dirs.length > 0){
			curDirs = this.state.cur_dir.dirs.map((name, index)=>{
				var codeObject = this.state.cur_dir.children[name];
				return (
					<ListGroupItem key={index}>
							<input 
								type="checkbox"
								onChange={(e)=>this.updateSelection.bind(this)(e, codeObject)}
							/>
							<span onClick={(e)=>this.navigateTo(name)}><i className="fa fa-folder"/> {name}</span>
					</ListGroupItem>
					)
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
					<ListGroupItem key={index} onClick={(e)=>this.selectCode(codeObject)}>
							<input 
								type="checkbox" 
								onChange={(e)=>this.updateSelection.bind(this)(e, codeObject)}
							/>
							<i className="fa fa-file"/> {name}
					</ListGroupItem>
					)
			})	
		}
		else {
			curFiles = (this.state.cur_dir.dirs && this.state.cur_dir.dirs.length > 0) ? 
				null : (<ListGroupItem className="text-center"> - Empty - </ListGroupItem>)
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
								value={this.state.cur_file.name}
								onChange={this.updateFileName.bind(this)}>
							</FormControl>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Content</ControlLabel>
							<AceEditor 
							 	onChange={this.updateFileContent.bind(this)}
								value={this.state.cur_file.content}></AceEditor>
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
								<i className="fa fa-refresh"/> Directory
							</Button>
							<Button className="pull-right" onClick={this.clearAll.bind(this)}>
								<i className="fa fa-file"/> Create New 
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

								{/* create a directory */}
								<FormGroup>
								    <InputGroup>
								      	<InputGroup.Button>
								        	<Button onClick={this.makeDir.bind(this)} bsStyle="success" block>
								        		+ <i className="fa fa-folder"/>
								        	</Button>
								      	</InputGroup.Button>
								      	<FormControl 
								      		type="text"
								      		value={this.state.mkdir_name}
								      		onChange={this.updateDirName.bind(this)} 
								      	/>
								    </InputGroup>
								</FormGroup>
							</ListGroup>

							<Button onClick={this.deleteSelection.bind(this)} bsStyle="danger" block>
								<i className="fa fa-trash"/> Delete Selected
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