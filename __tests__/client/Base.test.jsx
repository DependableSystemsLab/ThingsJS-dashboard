import React from 'react';
import { shallow, mount } from 'enzyme';
import Base from '../../src/client/pages/Base.jsx';
import renderer from 'react-test-renderer';

describe.skip('Base', () => {

	const __children__ = [0, 1, 2, 3];	

	const initialState = {
		dashboard: {
			files: {}
		}
	}

	it('Renders properly with props passed in', () => {
		const component = shallow(<Base children={__children__}></Base>);
		expect(component).toMatchSnapshot();
	});
});