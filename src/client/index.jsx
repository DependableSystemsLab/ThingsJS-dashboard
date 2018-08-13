import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import './global.css';
import App from './App.jsx';
import store from './store.js';
import { Dashboard } from './libs/things.js';

var dashboard = new Dashboard({
	pubsub_url: 'ws://'+window.location.hostname+':5000',
	fs_url: (window.location.origin+'/fs'),
});
dashboard.connectReduxStore(store);

ReactDOM.render(
	<Provider store={store}>
		<App dashboard={dashboard}/>
	</Provider>,
	document.getElementById("myApp")
);