const DashboardReducer = (state = { 
		engines: {},
		programs: {},
		files: {} 
	}, action) => {
	switch (action.type){
		case 'engine-registry-event':
			state = {
				engines: Object.assign({}, state.engines),
				programs: state.programs,
				files: state.files
			};
			state.engines[action.payload.engine.id] = action.payload.engine
			break;
		case 'program-monitor-event':
			state = {
				engines: state.engines,
				programs: Object.assign({}, state.programs),
				files: state.files
			};
			state.programs[action.payload.program.id] = action.payload.program
			break;
		case 'filesystem-event':
			state = {
				engines: state.engines,
				programs: state.programs,
				files: action.payload
			};
			break;
	}
	return state;
}

export default DashboardReducer;