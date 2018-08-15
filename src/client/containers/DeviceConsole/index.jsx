import React from 'react';
import {connect} from 'react-redux';
import {Form, FormControl, ButtonGroup, Button} from 'react-bootstrap';

import ProgramButtonGroup from '../ProgramButtonGroup/';

import styles from './styles.css';

class DeviceConsole extends React.Component{
	constructor (props){
		super();

		this.state = {
			instance_id: '',
			lines: props.engine.console.slice()
		}
	}

	__setup(){
		this.handlerID = this.props.engine.on('console-data', (lines)=>{
			// console.log("New Lines from Engine", lines);
			this.setState({
				lines: this.state.lines.concat(lines)	
			})
		})
	}
	__cleanUp(){
		if (this.state.instance_id){
			this.props.dash.programs[this.state.instance_id].removeHandler('console-data', this.handlerID);
		}
		else {
			this.props.engine.removeHandler('console-data', this.handlerID);
		}
	}

	componentDidMount(){
		this.__setup()
	}

	componentWillUnmount(){
		this.__cleanUp()
	}

	componentDidUpdate(){
		this.refs.terminal.scrollTop = this.refs.terminal.scrollHeight;
	}


	selectConsole(instance_id){
		console.log(instance_id);
		
		this.__cleanUp();

		if (!instance_id){
			this.__setup();
			this.setState({
				instance_id: '',
				lines: this.props.engine.console.slice()
			});
		}
		else {
			var program = this.props.dash.programs[instance_id];
			this.handlerID = program.on('console-data', (lines)=>{
				// console.log("New Lines from Program", lines);
				this.setState({
					lines: this.state.lines.concat(lines)
				})
			})

			this.setState({
				instance_id: instance_id,
				lines: program.console.slice()
			})
		}
	}

	render(){
		var procs = [];
		for (var code_name in this.props.engine.codes){
			var code = this.props.engine.codes[code_name];
			for (var instance_id in code){
				procs.push(<option key={instance_id} value={instance_id}>{code_name} {instance_id} ({code[instance_id]})</option>)
			}
		}

		return (
			<div>
				<Form inline>
					<FormControl onChange={(e)=>this.selectConsole(e.target.value)} componentClass="select" placeholder="Select Console">
						<option value={""}>Engine {this.props.engine.id}</option>
						{procs}
					</FormControl>
					{this.state.instance_id ? <ProgramButtonGroup program={this.props.programs[this.state.instance_id]}/> : null}
				</Form>
				<div ref="terminal" className='terminal'>
					{
						this.state.lines.map((line, index)=>{
							return <p key={index}>{line}</p>
						})
					}
				</div>
			</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceConsole);