import React from 'react';

class StreamViewer extends React.Component {
	constructor(props) {
		super();

		this.state = {
			data: ''
		}
		this.topic = props.topic;
		this.handlerID = null;
	}

	componentDidMount() {
		this.handlerID = this.props.pubsub.subscribe(this.topic, (topic, message)=>{
			this.setState({
				data: message
			})
		})
	}

	componentWillUnmount() {
		this.props.pubsub.unsubscribe(this.topic, this.handlerID);
	}

	render() {
		var stream = null;
		if (this.props.mimeType.includes('image')){
			stream = <img src={'data:'+this.props.mimeType+';base64,'+this.state.data}/>
		}
		return (
			<div>
				{this.topic}
				{stream}
			</div>
		)
	}
}

export default StreamViewer;