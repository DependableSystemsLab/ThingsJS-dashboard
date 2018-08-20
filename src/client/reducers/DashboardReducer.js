const DashboardReducer = (state = { 
		engines: {},
		programs: {},
		files: {} ,
		history: []
	}, action) => {
	switch (action.type){
		case 'engine-registry-event':
			state = {
				engines: Object.assign({}, state.engines),
				programs: state.programs,
				files: state.files,
				history: state.history
			};
			state.engines[action.payload.engine.id] = action.payload.engine
			break;
		case 'program-monitor-event':
			state = {
				engines: state.engines,
				programs: Object.assign({}, state.programs),
				files: state.files,
				history: state.history
			};
			state.programs[action.payload.program.id] = action.payload.program
			break;
		case 'filesystem-event':
			state = {
				engines: state.engines,
				programs: state.programs,
				files: action.payload,
				history: state.history
			};
			break;
		case 'system-event':
			state = {
				engines: state.engines,
				programs: state.programs,
				files: state.files,
				history: state.history.concat([action.payload.event])
			};
			break;
	}
	return state;
}

export default DashboardReducer;