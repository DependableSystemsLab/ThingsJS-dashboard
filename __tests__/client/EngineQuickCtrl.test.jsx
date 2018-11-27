import React from 'react';
import EngineQuickCtrl from '../../src/client/containers/EngineQuickCtrl/index.jsx';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux-mock-store';

describe('EngineQuickCtrl', () => {

	let curDir = {
		files: ['test1'],
		content: { test1: { type: 'file', content: 'test' } }
	}

	const __fs__ = {
		get: jest.fn(() => { return Promise.resolve(curDir) })
	}

	const __engine__ = {
		runCode: jest.fn((engine, code) => { return Promise.resolve() })
	}

	const initialState = {
		dashboard: {
			engines: {},
			programs: {}, 
			files: {}
		}
	}

	const mockStore = configureStore();

	let __store__;

	beforeEach(() => {
		__store__ = mockStore(initialState);
	});

	it('Renders correctly with props passed in', () => {
		let component = shallow(<EngineQuickCtrl fs={__fs__} engine={__engine__} store={__store__}/>);
		expect(component).toMatchSnapshot();
	});


});