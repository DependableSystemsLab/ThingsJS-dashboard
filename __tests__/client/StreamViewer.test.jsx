import React from 'react';
import { shallow, mount } from 'enzyme';
import StreamViewer from '../../src/client/components/StreamViewer/index.jsx';
import renderer from 'react-test-renderer';
import { Dashboard } from '../../src/client/libs/things.js'


describe('StreamViewer', () => {

	const topic = 'streamviewer-test';

	it('Renders properly with props', () => {
		const pubsub = {
			subscribe: jest.fn(),
			unsubscribe: () => {}
		}
		const component = renderer.create(
			<StreamViewer 
				pubsub={pubsub}
				topic={topic}
				mimeType='image/png'
			/>);

		expect(component.toJSON()).toMatchSnapshot();

		// first arg of first call should subscribe to the passed topic
		expect(pubsub.subscribe.mock.calls[0][0]).toBe(topic);
	});

	it('Renders the image passed in', () => {
		const pubsub = {
			subscribe: jest.fn(),
			unsubscribe: () => {}
		}

		const component = renderer.create(
			<StreamViewer
				pubsub={pubsub}
				topic={topic}
				mimeType='image/png'
			/>);

		// invoke the pubsub callback
		pubsub.subscribe.mock.calls[0][1](topic, 'image');
		expect(component.toJSON()).toMatchSnapshot();
	});

	it('Unmounts', () => {
		const pubsub = {
			subscribe: () => {},
			unsubscribe: jest.fn()
		}

		const component = mount(
			<StreamViewer
				pubsub={pubsub}
				topic={topic}
				mimeType='image/png'
			/>);

		// stop subscribing to the videostream upon unmount
		component.unmount();
		expect(pubsub.unsubscribe.mock.calls.length).toBe(1);
	});

});