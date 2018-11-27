import React from 'react';
import FilesystemViewer from '../../src/client/containers/FilesystemViewer/index.jsx';
import { shallow, mount } from 'enzyme';

describe('FilesystemViewer', () => {

	let curDir = {
		dirs: ['file1', 'file2'],
		files: ['dir1', 'dir2'],
		content: {
			file1: { type: 'file', content: 'hello' },
			file2: { type: 'file', content: 'hello' },
			dir1: { type: 'directory', content: {} },
			dir2: { type: 'directory', content: {} }
		}
	}

	const __fs__ = {
		get: jest.fn((path) => { return Promise.resolve(curDir); }),
		makeDir: jest.fn((path, dirName) => { return Promise.resolve(); }),
		writeFile: jest.fn((path, file) => { return Promise.resolve(); }),
		deleteFile: jest.fn((path, ids) => { return Promise.resolve(); })
	}
	const __dash__ = {
		fs: __fs__
	}

	it('Renders properly with props passed in', () => {
		let component = shallow(<FilesystemViewer dash={__dash__}/>);
		expect(component).toMatchSnapshot();
	});

	
});
