import React from 'react';
import { shallow, mount } from 'enzyme';
import DeviceList from '../../src/client/containers/DeviceList/index.jsx';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

describe('DeviceList', () => {

	const initialState = {
		dashboard: {
			engines: {}
		}
	}

	const mockState = {
		dashboard: {
			engines: {
				'test-engine': {
					id: 'test-engine',
					meta: { device: 'raspberry-pi3', status: 'busy' },
					getProcesses:() => { return []; }
				}
			}
		}
	}

	const mockStore = configureStore();
	let __menuFunc__;
	
	beforeEach(() => {
		__menuFunc__ = jest.fn();
	});

	it('Renders properly with props', () => {
		let __store__ = mockStore(initialState);
		let component = shallow(<DeviceList menuFunc={__menuFunc__} store={__store__}></DeviceList>)
		expect(component).toMatchSnapshot();
	});

	it('Renders properly with an existing engine', () => {
		let __store__ = mockStore(mockState);
		let component = shallow(<DeviceList menuFunc={__menuFunc__} store={__store__}></DeviceList>)
		expect(component).toMatchSnapshot();
	});
});