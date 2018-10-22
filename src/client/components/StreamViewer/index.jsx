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

	componentDidUpdate(prevProps){
		if (prevProps.topic != this.props.topic){
			if (this.handlerID){
				this.props.pubsub.unsubscribe(prevProps.topic, this.handlerID);
			}
			this.topic = this.props.topic;
			this.handlerID = this.props.pubsub.subscribe(this.topic, (topic, message)=>{
				this.setState({
					data: message
				})
			})
		}
	}

	render() {
		var stream = null;
		if (this.props.mimeType in StreamViewer.MIMETYPES){
			var mode = StreamViewer.MIMETYPES[this.props.mimeType];
			switch(mode){
				case 'image':
					stream = this.state.data ?
						<img src={'data:'+this.props.mimeType+';base64,'+this.state.data} style={{ width: '100%' }}/>
						: <p>No data from stream</p>
					break;
				case 'json':
					break;
				case 'plaintext':
					break;
				case 'html':
					break;
				default:
					stream = <p>Cannot view MimeType = {this.props.mimeType}</p>
					break;
			}
		}
		else {
			stream = <p>No stream selected</p>
		}
		return (
			<div>
				{stream}
			</div>
		)
	}
}
StreamViewer.MIMETYPES = {
	'image/png': 'image',
	'image/jpeg': 'image',
	'application/json': 'json',
	'text/plain': 'plaintext',
	'text/html': 'html',
}

export default StreamViewer;