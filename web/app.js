
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
  , api = require('./routes/api');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// initialize response model - must occur before app.router
	app.use(function(req, res, next){
		res.model = {
			title: "DCC2013.2 Polymer Demo"
		};
		next();
	});

	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
app.configure('development', function(){
  app.use(express.errorHandler());
});

// handle the api as a middleware
app.use('/api/', api)

// register pages
app.get('/', routes.index);
app.get('/trackers', routes.trackers)




http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
