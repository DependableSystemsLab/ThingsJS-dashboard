import React from 'react';
import {connect} from 'react-redux';
import {ButtonGroup, Button, Dropdown, FormControl, OverlayTrigger, Tooltip} from 'react-bootstrap';

class EngineQuickCtrl extends React.Component {
	constructor (props){
		super();
		console.log(props);
		this.$dash = props.dash
		this.state = {
			selectedCode: '',
			codes: {}
		}
	}

	componentDidMount(){
		this.$dash.fs.get('/codes/')
			.then((fsObject)=>{

				// console.log(fsObject);
				this.setState({
					codes: fsObject.children
				});

			});
	}

	selectCode (code_name){
		this.setState({
			selectedCode: code_name
		})
	}

	runCode (){
		this.props.engine.runCode(this.state.selectedCode, this.state.codes[this.state.selectedCode].content);
	}

	render() {
		return (
			<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-engine-quick">More</Tooltip>}>
				<Dropdown id="dropdown-engine-quick">
					<Dropdown.Toggle bsStyle="info" bsSize="small" noCaret>
						<i className="fa fa-ellipsis-v"/>
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<FormControl onChange={(evt)=>this.selectCode(evt.target.value)}
							componentClass="select"
							value={this.state.selectedCode || ''}
							placeholder="Select Code">
							<option value={''}>--- Select Code ---</option>
							{
								Object.keys(this.state.codes).map((key)=>{
									// if (this.props.program.engine.id !== key)
										return <option key={key} value={key}>{key}</option>
									// return null;
								})
							}
						</FormControl>
						{
							// this.state.engine_id ?
								<Button bsStyle="primary" onClick={(e)=>this.runCode()}>
									<i className="fa fa-play"/> Run
								</Button>
								// : null
						}
					</Dropdown.Menu>
				</Dropdown>
			</OverlayTrigger>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines,
		programs: state.dashboard.programs,
		files: state.dashboard.files
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(EngineQuickCtrl);