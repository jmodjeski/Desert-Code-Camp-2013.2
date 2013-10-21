var db = require('../db'),
  _ = require('lodash');

var handler = function(res, fn){
  return function(err) {
    if(err) res.send(500, err);
    else fn.apply(this, arguments);
  };
};

exports = module.exports = function(req, res, next){
  db.meetings.findById(req.params.id, handler(res, function(err, model){
    res.model.meeting = model;
    res.render('analytics', res.model);
  }));
};