import React from 'react';
import {connect} from 'react-redux';
import {ButtonGroup, Button, Dropdown, FormControl, OverlayTrigger, Tooltip} from 'react-bootstrap';

class ProgramButtonGroup extends React.Component {
	constructor (){
		super();
		this.state = {
			engine_id: '',
		}
	}

	selectTargetEngine (engine_id){
		this.setState({
			engine_id: engine_id
		})
	}

	render() {
		var killBtn = (this.props.program.status !== 'Exited') ?
			(<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-kill">Kill</Tooltip>}>
				<Button bsStyle="danger" onClick={()=>this.props.program.kill()}>
					<i className="fa fa-stop"/>
				</Button>
			</OverlayTrigger>) : null;

		var pauseResumeBtn = (this.props.program.status === 'Exited') ? null : (
				(this.props.program.status === 'Running') ? 
				(<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-pause">Pause</Tooltip>}>
					<Button bsStyle="warning" onClick={()=>this.props.program.pause()}>
						<i className="fa fa-pause"/>
					</Button>
				</OverlayTrigger>)
				: (<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-resume">Resume</Tooltip>}>
					<Button bsStyle="success" onClick={()=>this.props.program.resume()}>
						<i className="fa fa-play"/>
					</Button>
				</OverlayTrigger>)
			);

		return (
			<ButtonGroup bsSize="small">
				{killBtn}
				{pauseResumeBtn}
				<OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-program-migrate">Migrate</Tooltip>}>
					<Dropdown id="dropdown-program-migrate">
						<Dropdown.Toggle bsStyle="info" bsSize="small">
							<i className="fa fa-exchange"/>
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<FormControl onChange={(evt)=>this.selectTargetEngine(evt.target.value)}
								componentClass="select"
								value={this.state.engine_id || ''}
								placeholder="Select Engine">
								<option value={''}>--- Select Engine ---</option>
								{
									Object.keys(this.props.engines).map((key)=>{
										if (this.props.program.engine.id !== key)
											return <option key={key} value={key}>{key}</option>
										return null;
									})
								}
							</FormControl>
							{
								this.state.engine_id ?
									<Button bsStyle="primary" onClick={(e)=>this.props.program.migrate(this.state.engine_id)}>
										<i className="fa fa-check"/> OK
									</Button>
									: null
							}
						</Dropdown.Menu>
					</Dropdown>
				</OverlayTrigger>
			</ButtonGroup>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProgramButtonGroup);