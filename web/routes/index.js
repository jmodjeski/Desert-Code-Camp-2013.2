/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', res.model);
};

exports.meeting = require("./meeting");
exports.analytics = require("./analytics");
