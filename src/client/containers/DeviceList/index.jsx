import React from 'react';
import {connect} from 'react-redux';
import {Image, ListGroup, ListGroupItem, Badge} from 'react-bootstrap';

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
	return (
		<ListGroupItem className={('device-list-item engine-'+props.engine.status)}>
			<Image src={ICON_MAP[props.engine.meta.device]} className="engine-icon"/>
			{props.engine.id}
			<Badge>{props.engine.status}</Badge>
		</ListGroupItem>
	)
}

class DeviceList extends React.Component {
	render(){
		var devices;
		if (Object.keys(this.props.engines).length > 0){
			devices = Object.keys(this.props.engines).map((key)=>{
				return <DeviceItem key={key} engine={this.props.engines[key]}/>
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