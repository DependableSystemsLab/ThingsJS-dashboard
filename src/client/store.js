import { createStore, combineReducers, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise-middleware';

import DashboardReducer from './reducers/DashboardReducer';

export default createStore(
	combineReducers({
		dashboard: DashboardReducer
	}),
	{},
	// applyMiddleware(logger, thunk, promise())
);