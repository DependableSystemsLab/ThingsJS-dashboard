import React from 'react';
import { shallow, mount } from 'enzyme';
import AppBuilder from '../../src/client/containers/ApplicationBuilder/index.jsx';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';

describe('ApplicationBuilder', () => {

	const folder = {
		content: {}
	}

	const __fs__ = {
		get: jest.fn((path) => { return Promise.resolve(folder); }),
		writeFile: jest.fn((path, file) => { return Promise.resolve(); }),
		delete: jest.fn((path, ids) => { return Promise.resolve(); })
	}

	const __dash__ = {
		runApplication: jest.fn((details) => { return Promise.resolve(); }),
		pauseApplication: jest.fn((token) => { return Promise.resolve(); }),
		resumeApplication: jest.fn((token) => { return Promise.resolve(); }),
		killApplication: jest.fn((token) => { return Promise.resolve(); }),
		fs: __fs__,
		on: jest.fn((event) => { return Promise.resolve(); })
	}

	const mockStore = configureStore();

	const initialState = {
		dashboard: {
			files: {}
		}
	}

	let __store__;
	let component;

	beforeEach(() => {
		__store__ = mockStore(initialState);
		component = shallow(<AppBuilder dash={__dash__} store={__store__}/>);
	});	

	it('Renders properly with props', () => {
		expect(component).toMatchSnapshot();
	});

	describe.skip('Button clicks', () => {
		it('Adds and removes a component', () => {
			component.find().simulate('click');

			addLen = Object.keys(component.state().cur_apps.components).length;
			expect(addLen).toBeGreaterThan(0);

			component.find().simulate('click');
			removeLen = Object.keys(component.state().cur_apps.components).length;
			expect(addLen).toEqual(0);
		});

		it('Saved application is written to filesystem', () => {
			var state = component.state();
			state.cur_app = {
				name: 'test-app',
				components: {
					'test-component': { source: '', count: 1, required_memory: 1 }
				}
			}
			component.setState(state);

			component.find().simulate('click');
			writeCalls = __fs__.writeFile.instances.length;
			expect(JSON.parse(__fs__.writeFile.instances[writeCalls-1][1]).content)
				.toEqual(JSON.stringify(state.cur_app));
		});
	});

});