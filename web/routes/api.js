
var _ = require('underscore'),
  db = require('../db'),
  url = require('url');

  var get = function(repo, req, res, next){
    var urlParts = url.parse(req.url).pathname.split(/\//);
    var id = urlParts[2];
    var query = req.query || {};
    if(id) {
      query = {_id: id};
    }
    repo.find(query, {}, function(err, result, next){
      res.send(err ? 500 : 200, err || result);
      next();
    })
  };

  var put = function(repo, req, res, next){
    var id = req.url.split(/\//, 3)[2];
    var query = { _id: id };
    repo.update({query: query, data: req.body}, {}, function(err, result, next){
      res.send(err ? 500 : 201, err || result);
      next();
    })
  };

  var post = function(repo, req, res, next){
    repo.create(req.body, {}, function(err, result, next){
      res.send(err ? 500 : 200, err || result);
      next();
    })
  };

  var del = function(repo, req, res, next){
    var id = req.url.split(/\//, 3)[2];
    repo.remove(id, {}, function(err, result, next){
      res.send(err ? 500 : 200);
      next();
    })
  };

  exports = module.exports = function(req, res, next){
    var segment = url.parse(req.url).pathname.split(/\//, 2)[1];
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


