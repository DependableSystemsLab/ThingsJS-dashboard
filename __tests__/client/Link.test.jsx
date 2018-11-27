import React from 'react';
import { shallow, mount } from 'enzyme';
import Link from '../../src/client/components/Link/index.jsx';
import renderer from 'react-test-renderer';

describe('Link', () => {

	const children = ['link0', 'link1', 'link2'];

	beforeAll(() => {
	});

	it('Renders properly', () => {
		const component = renderer.create(<Link children={children}></Link>);
		expect(component.toJSON()).toMatchSnapshot();
	});

	it('Handles onClick', () => {
		window.open = jest.fn();
		const url = 'link-test';

		const output = shallow(<Link children={children} to={url}></Link>);
		output.simulate('click');
		expect(window.open.mock.calls[0][0]).toBe(url);
	});

	afterAll(() => {
	});
	
});