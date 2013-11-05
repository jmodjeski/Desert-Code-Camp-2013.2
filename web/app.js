
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    api = require('./routes/api'),
    fs = require('fs');

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

  // setup hijack route to enable jade template elements
  // must occur before 'static' middleware registration
  app.use('/elements', function(req, res, next){
    var renderPath = 'elements' + req.url.replace('.html', '.jade')
    var path = __dirname + '/views/' + renderPath;
    fs.exists(path, function(exists){
      if(exists) res.render(renderPath);
      else next();
    });
  })
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
app.configure('development', function(){
  app.use(express.errorHandler());
});

// handle the api as a middleware
app.use('/api/', api);

// register pages
app.get('/', routes.index);
app.get('/meeting/:id', routes.meeting);
app.get('/analytics/:id', routes.analytics);


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
