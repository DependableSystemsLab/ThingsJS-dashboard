import React from 'react';
import Applications from '../../src/client/pages/Applications.jsx';
import { shallow, mount } from 'enzyme';

describe('Applications', () => {

	const __fs__ = {
		get: jest.fn(path => {}),
		writeFile: jest.fn((path, file) => {}),
		delete: jest.fn((path, ids) => {})
	}

	const __dash__ = {
		runApplication: jest.fn(details => {}),
		pauseApplication: jest.fn(token => {}),
		resumeApplication: jest.fn(token => {}),
		killApplication: jest.fn(token => {}),
		fs: __fs__
	}

	let component;

	beforeEach(() => {
		component = shallow(<Applications dash={__dash__}/>);
	})

	it('Renders properly with the correct props', () => {
		expect(component).toMatchSnapshot();
	});

});