
var _ = require('underscore'),
  db = require('../db'),
  url = require('url');

  var findModel = function (repo, id, segments, callback, query) {
    if (!id)
      repo.find(query, callback);
    else
      repo.findById(id, function (err, model) {
        if (segments.length > 0)
          findSubModel(model, segments, callback);
        else
          callback(err, model);
      });
  }

  var findSubModel = function (model, segments, callback) {
    if (segments.length === 1) {
      callback(undefined, model[segments[0]]);
    } else if (model[segments[0]].findById) {
      model[segments[0]].findById(segments[1], function (err, m) {
        if (!err) {
          model = m;
          if (segments.length > 2) {
            segments = segments.slice(2, segments.length);
            findSubModel(model, segments, callback);
          } else {
            callback(err, model);
          }
        }
      });
    } else {
      model = model[segments[0]].id(segments[1]);
      if (segments.length > 2) {
        segments = segments.slice(2, segments.length);
        findSubModel(model, segments, callback);
      } else {
        callback(undefined, model);
      }
    }
  }

  var get = function(repo, req, res, next){
    var urlParts = url.parse(req.url).pathname.split(/\//);
    var id = urlParts[2];
    var query = req.query || {};
    urlParts = urlParts.slice(3, urlParts.length);
    findModel(repo, id, urlParts, function (err, model) {
      res.send(err ? 500 : 200, err || model);
    }, query);
  };

  var put = function(repo, req, res, next){
    var urlParts = req.url.split(/\//);
    var id = urlParts[2];
    findModel(repo, id, [], function (err, model) {
      var rootModel = model;
      if (urlParts.length < 3) {
        rootModel = _.extend(rootModel, req.body);
        rootModel.save(function (err, updatedRoot, recordCount) {
          res.send(err ? 500 : 200);
        });
      } else {
        findSubModel(rootModel, urlParts.slice(3, urlParts.length), function (err, model) {
          model = _.extend(model, req.body);
          rootModel.save(function (err, updatedRoot, recordCount) {
            res.send(err ? 500 : 200);
          });
        });
      }
    });
  };

  var post = function(repo, req, res){
    var urlParts = url.parse(req.url).pathname.split(/\//);
    if (urlParts.length < 3) {
      repo.create(req.body, {}, function(err, result){
        res.set({
          'Location': result._id
        });
        res.send(err ? 500 : 201, err || result);
      });
    } else {
      var id = urlParts[2];
      var rootModel = {};
      findModel(repo, id, [], function (err, model) {
        rootModel = model;
        if (err) res.send(500, err);
        else {
          findSubModel(rootModel, urlParts.slice(3, urlParts.length), function (err, model) {
            if (Object.prototype.toString.call(model) === '[object Array]') {
              model.push(req.body);
              rootModel.save(function (err, updatedRoot, recordCount) {
                res.set({
                  'Location': model[model.length - 1]._id
                });
                res.send(err ? 500 : 201, err);
              });
            }
          }); 
        }
      });
    }
  }  

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
            post(db[segment], req, res);
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


