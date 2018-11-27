import DashboardReducer from '../../src/client/reducers/DashboardReducer.js';

describe('Dashboard Reducer', () => {

	const eventTypes = {
		engine: 'engine-registry-event',
		program: 'program-monitor-event',
		fs: 'filesystem-event',
		sys: 'system-event'
	}

	const initialState = {
		engines: {},
		programs: {},
		files: {}, 
		history: []
	}

	const existingState = {
		engines: { 'some-engine': {} },
		programs: { 'some-program': {} },
		files: { 'some-file': {} },
		history: [{}] 
	}

	it('Should return the initial state', () => {
		expect(DashboardReducer(undefined, {})).toEqual(initialState);
	});

	it('Should return the previous state for non-matching action type', () => {
		expect(DashboardReducer(existingState, {})).toEqual(existingState);
	});

	it('Should handle ' + eventTypes.engine, () => {
		let engineData = { 
			id: 'test-engine', 
			status: 'idle'
		}

		let expectedState = JSON.parse(JSON.stringify(initialState));
		expectedState.engines[engineData.id] = engineData;

		expect(DashboardReducer(undefined, {
			type: eventTypes.engine,
			payload: { engine: engineData }
		})).toEqual(expectedState);
	});

	it('Should handle ' + eventTypes.program, () => {
		let programData = {
			id: 'test-program',
			status: 'exited'
		}

		let expectedState = JSON.parse(JSON.stringify(initialState));
		expectedState.programs[programData.id] = programData;

		expect(DashboardReducer(undefined, { 
			type: eventTypes.program, 
			payload: { program: programData } 
		})).toEqual(expectedState);
	});

	it('Should handle ' + eventTypes.fs, () => {
		let fsData = {
			file: {}
		}

		let expectedState = JSON.parse(JSON.stringify(initialState));
		expectedState.files = fsData;

		expect(DashboardReducer(undefined, {
			type: eventTypes.fs,
			payload: fsData
		})).toEqual(expectedState);
	});

	it('Should handle ' + eventTypes.sys, () => {
		let sysData = { 
			event: true 
		}

		let expectedState = JSON.parse(JSON.stringify(initialState));
		expectedState.history.push(sysData);

		expect(DashboardReducer(undefined, {
			type: eventTypes.sys,
			payload: { event: sysData }
		})).toEqual(expectedState);
	});
});