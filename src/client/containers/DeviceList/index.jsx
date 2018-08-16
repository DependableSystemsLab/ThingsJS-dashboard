import React from 'react';
import {connect} from 'react-redux';
import {Image, ListGroup, ListGroupItem, Badge, OverlayTrigger, Popover} from 'react-bootstrap';

import style from './style.css';

import IconUnknown from './icons/device-unknown-sm.png';
import IconXeonE3 from './icons/device-xeon-e3-sm.png';
import IconXeonE5 from './icons/device-xeon-e5-sm.png';
import IconPi3 from './icons/device-raspberry-pi3-sm.png';
import IconPi0 from './icons/device-raspberry-pi0-sm.png';

const ICON_MAP = {
	'undefined': IconUnknown,
	'xeon-e3': IconXeonE3,
	'xeon-e5': IconXeonE5,
	'raspberry-pi3': IconPi3,
	'raspberry-pi0': IconPi0
}

function DeviceItem(props) {
	var procs = props.engine.getProcesses().filter((proc)=>proc.status!=='Exited');
	var active = procs.filter((proc)=>proc.status==='Running').length;
	return (
		<OverlayTrigger trigger="click" overlay={props.menuFunc(props)} rootClose>
			<ListGroupItem className={('device-list-item engine-'+props.engine.status)}>
				<Image src={ICON_MAP[props.engine.meta.device]} className="engine-icon"/>
				{props.engine.id}
				<Badge>{props.engine.status} ({active+'/'+procs.length})</Badge>
			</ListGroupItem>
		</OverlayTrigger>
	)
}

const DISPLAY_ORDER = ['idle', 'busy', 'dead'];

class DeviceList extends React.Component {
	render(){
		var devices;
		if (Object.keys(this.props.engines).length > 0){
			devices = Object.values(this.props.engines)
				.sort((a, b)=>( ( DISPLAY_ORDER.indexOf(a.status) - DISPLAY_ORDER.indexOf(b.status) )
								|| (a.id < b.id ? -1 : (a.id > b.id ? 1 : 0)) ) )	// Lambda compareFunction (first order by status then by id)
				.map((engine)=>{
					return <DeviceItem key={engine.id} engine={engine} menuFunc={this.props.menuFunc}/>
				})
		}
		else {
			devices = (<ListGroupItem>No Device</ListGroupItem>)
		}

		return (
			<ListGroup>{devices}</ListGroup>
		)
	}
}

const mapStateToProps = (state)=>{
	return {
		engines: state.dashboard.engines
	}
}
const mapDispatchToProps = (dispatch)=>{
	return {

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);