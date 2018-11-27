import React from 'react';
import { shallow, mount } from 'enzyme';
import ApplicationCtrl from '../../src/client/containers/ApplicationCtrl/index.jsx';
import renderer from 'react-test-renderer';

describe('ApplicationCtrl', () => {

	const file = {
		content: {}
	}

	const runningApps = {
		'running-app': { status: 'Running' },
		'paused-app': { status: 'Paused' },
		'killed-app': { status: 'Exited' }
	}

	const __fs__ = {
		get: jest.fn((path) => { return Promise.resolve(file); })
	}

	const __dash__ = {
		on: jest.fn((event) => { return Promise.resolve(runningApps); }),
		removeHandler: jest.fn((event) => { return true; }),

		fs: __fs__,

		runApplication: jest.fn((app) => { return Promise.resolve(); }),
		pauseApplication: jest.fn((token) => { return Promise.resolve(); }),
		resumeApplication: jest.fn((token) => { return Promise.resolve(); }),
		killApplication: jest.fn((token) => { return Promise.resolve(); })
	}

	it('Renders properly with props', () => {
		let component = shallow(<ApplicationCtrl dash={__dash__}/>);
		expect(component).toMatchSnapshot();
	});

	describe.skip('Button clicks', () => {
		let component = mount(<ApplicationCtrl dash={__dash__}/>);

		it('Select an application to run', () => {
			component.find().simulate('click');
		});

		it('Select an application to pause', () => {
			component.find().simulate('click');
			expect(__dash__.pauseApplication.calls[0][0].toBe('running-app'));

		});

		it('Select an application to resume', () => {
			component.find().simulate('click');
			expect(__dash__.resumeApplication.calls[0][0].toBe('pause-app'));
		});

		it('Select an application to kill', () => {
			component.find().simulate('click');
			expect(['pause-app', 'kill-app'].toContain(__dash__.killApplication.calls[0][0]));
		});
	});
});