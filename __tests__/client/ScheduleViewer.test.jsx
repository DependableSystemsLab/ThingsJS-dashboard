import React from 'react';
import { shallow, mount } from 'enzyme';
import ScheduleViewer from '../../src/client/containers/ScheduleViewer/index.jsx';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

describe('ScheduleViewer', () => {

	Date.now = jest.fn;

	const __dash__ = {};

	const __engines__ = {
		engine1: { status: 'idle', stats: { timestamp: Date.now(), cpu: 123 } },
		engine2: { status: 'busy', stats: { timestamp: Date.now(), cpu: 123 } }
	}

	const __programs__ = {
		'program1': { id: 'program1', stats: { timestamp: Date.now(), cpu: 123 } }
	}

	const __history__ = [
		{ type: 'scheduler-event', timestamp: Date.now(), data: {} },
		{ type: 'engine-event', timestamp: Date.now(), data: {} },
		{ type: 'program-event', timestamp: Date.now(), data: {} }
	]

	const initialState = {
		dashboard: {
			engines: {}, 
			programs: {},
			history: {}
		}
	}

	const mockStore = configureStore();

	let __store__;

	beforeEach(() => {
		__store__ = mockStore(initialState);
	});

	it('Renders properly with props passed in', () => {
		let component = shallow(
			<ScheduleViewer
				engines={__engines__}
				programs={__programs__}
				history={__history__}
				store={__store__}
			/>);

		expect(component).toMatchSnapshot();
	});
	
});