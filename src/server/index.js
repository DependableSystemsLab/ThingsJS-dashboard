var path = require('path');
var http = require('http');
// var mongoose = require('mongoose');
var express = require('express');
// var session = require('express-session');
// var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var chalk = require('chalk');

var MqttWsBridge = require('things-js').util.MqttWsBridge;
var FSServer = require('things-js').addons.FSServer;

/* helpers */
function httpDebugger(req, res, next){
	console.log(chalk.yellow(req.method)+ ' '+req.originalUrl+' ----- '+chalk.yellow(req.sessionID));
	// ([ 'referrer', 'cookie', 'user-agent' ])
	Object.keys(req.headers).map(function(key){
		console.log('    '+chalk.blue(key+' : ')+req.headers[key]);
	})
	if (req.body){
		Object.keys(req.body).map(function(key){
			console.log('    '+chalk.red(key+' : ')+req.body[key]);
		})
	}
	next();
}

var SERVICE_PORT = 8000;
var STATIC_PATH = path.resolve(__dirname, '../../dist/');
var FS_DB_URL = 'mongodb://localhost:27017/things-js-fs'
var DOCS_PATH = path.resolve(__dirname, '../../docs');

var bridge = new MqttWsBridge('mqtt://localhost', { host: '0.0.0.0', port: 5000 });
var gfs_router = express.Router()
var gfs = new FSServer(FS_DB_URL, gfs_router);

/* Create main express app  */
var app = express();
var server = http.createServer(app);

// Use a bunch of middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(httpDebugger);

/* Public App */
app.use('/docs', express.static(DOCS_PATH));
app.use('/fs', gfs_router);

app.use('/', express.static(STATIC_PATH));
app.get('*', function(req, res, next){
	res.redirect('/#'+req.originalUrl);
});
server.listen(SERVICE_PORT, function(){
	console.log(chalk.green(">>> Starting web service on PORT :"+SERVICE_PORT));
});