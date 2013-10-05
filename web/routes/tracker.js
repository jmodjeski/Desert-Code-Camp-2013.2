var db = require('../db');

exports = module.exports = function(req, res, next){
	res.model.title = "Trackers - " + res.model.title;

	db.trackers.find();

	res.render('trackers', res.model);
};
