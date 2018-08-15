const DashboardReducer = (state = { 
		engines: {},
		programs: {},
		files: {} 
	}, action) => {
	switch (action.type){
		case 'engine-registry-event':
			state = {
				engines: Object.assign({}, state.engines),
				files: state.files
			};
			state.engines[action.payload.engine.id] = action.payload.engine
			break;
		case 'filesystem-event':
			state = {
				engines: state.engines,
				files: action.payload
			};
			break;
	}
	return state;
}

export default DashboardReducer;