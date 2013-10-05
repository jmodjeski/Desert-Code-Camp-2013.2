/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', res.model);
};

exports.trackers = require("./tracker");
