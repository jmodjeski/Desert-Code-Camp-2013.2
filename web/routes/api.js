
var _ = require('underscore'),
  db = require('../db');

  var get = function(repo, req, res, next){
    repo.find({}, {}, function(err, result, next){
      console.log(err, result);
      res.send(err ? 500 : 200, err || result);
      next();
    })
  };

  var put = function(repo, req, res, next){
    repo.update({}, {}, function(err, result, next){
      res.send(err ? 500 : 201, err || result);
      next();
    })
  };

  var post = function(repo, req, res, next){
    console.log(req.body);
    repo.create(req.body, {}, function(err, result, next){
      console.log(err);
      console.log(result);
      res.send(err ? 500 : 200, err || result);
      next();
    })
  };

  var del = function(repo, req, res, next){
    repo.remove({}, {}, function(err, result, next){
      res.send(err ? 500 : 200, err || result);
      next();
    })
  };

  exports = module.exports = function(req, res, next){
    var segment = req.url.split(/\//, 2)[1];
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
          break;
        case 'POST':
          handler = function () {
            post(db[segment], req, res, next);
          };
          break;
        case 'DELETE':
          handler = function () {
            del(db[segment], req, res, next);
          };
          break;
      }
    }
    handler();
  };


