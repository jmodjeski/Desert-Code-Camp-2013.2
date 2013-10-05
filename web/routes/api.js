
var _ = require('underscore'),
  db = require('../db');

  var get = function(repo, req, res, next){
    repo.find({}, {}, function(err, result){
      res.send(err || result);
      next();
    })
  };

  var put = function(repo, req, res, next){
    repo.update({}, {}, function(err, result){
      res.send(err ? 500 : 201, err || result);
      next();
    })
  };

  var post = function(repo, req, res, next){
    repo.create({}, {}, function(err, result){
      res.send(err || result);
      next();
    })
  };

  var del = function(repo, req, res, next){
    repo.remove({}, {}, function(err, result){
      res.send(err || result);
      next();
    })
  };

  exports = module.exports = function(req, res, next){
    console.log("--------------------")
    console.log(req.url);
    console.log(req.method);
    var segment = req.url.split(/\//, 2)[1];
    console.log(segment);
    console.log(db[segment]);
    console.log(db[segment].find);
    var handler = next;
    if(db[segment])
    {
      switch(req.method)
      {
        case 'GET':
          handler = function(){
            get(db[segment], req, res, next);
          };
          break;
        case 'PUT':
          handler = function () {
            put(db[segment], req, res, next);
          };
        case 'POST':
          handler = function () {
            post(db[segment], req, res, next);
          };
        case 'DELETE':
          handler = function () {
            del(db[segment], req, res, next);
          };
      }
    }
    handler();
  };


