
var _ = require('underscore'),
  db = require('../db'),
  url = require('url');

  var appendUrl = function(url, suffix){
    if(url[url.length -1] == '/') return url + suffix;
    else return url +'/'+suffix;
  };

  var parseUrl = function(req){
    // pathname starts with '/' so we strip off the empty item
    // at the begining of the segments array
    var parts = url.parse(req.url).pathname.split(/\//).slice(1);
    var paths = [];
    for(var i = 0; i < parts.length; i++)
    {
      var model = {
        segment: parts[i],
        id: (i++ < parts.length ? parts[i] : undefined)
      };
      paths.push(model);
    }

    return paths;
  };

  // keep shifting paths to find the deepest model
  // requested, invoke fn on it when found
  var findchild = function(err, paths, model, fn){
    var path = paths.shift();
    var child = model[path.segment];
    if(path.id) child = child.id(path.id);
    if(paths.length !== 0) findchild(err, paths, child, fn);
    else fn(err, child);
  };

  var finalHandler = function(res, blockResult){
    return function(err, result, status, headers){
      console.log(err);
      if (headers) res.set(headers);
      if(err) res.send(500, err);
      else res.send(status || 200, blockResult ? undefined : result);
    };
  };

  var get = function(repo, req, res, next){
    var handler = finalHandler(res);
    var paths = parseUrl(req);
    var path = paths.shift();

    if(path.id) {
      repo.findById(path.id, function(err, model){
        if(paths.length === 0) handler(err, model, 200);
        else findchild(err, paths, model, handler);
      });
    } else {
      repo.find(req.query, handler);
    }
  };


  var put = function(repo, req, res, next){
    var handler = finalHandler(res);
    var paths = parseUrl(req);
    var path = paths.shift();

    var save = function(parent) {
      return function(err, model){
        if(err) handler(err);
        else {
          _.extend(model, req.body);
          parent.save(function(err){
            handler(err, model, 200);
          });
        }
      };
    };

    repo.findById(path.id, function(err, model){
      var fn = save(model);
      if(paths.length === 0) fn(err, model);
      else findchild(err, paths, model, fn);
    });
  };


  var post = function(repo, req, res){
    var handler = finalHandler(res);
    var paths = parseUrl(req);
    var path = paths.shift();

    var created = function(err, model){
        if(err) res.send(500, err);
        else {
          handler(err, model, 201, {
            'Location': appendUrl('/api' + req.url, model.id)
          });
        }
    };

    if(path.id) {
      repo.findById(path.id, function(err, parent){
        if(paths.length === 0) handler(new Error("Invalid path to child model"));
        else findchild(err, paths, parent, function(err, set){
          if(err) handler(err);
          else {
            var model = set.create(req.body);
            set.push(model);
            parent.save(function(err, m){
              // override created to send in child model
              created(err, model);
            });
          }
        });
      });
    } else {
      var model = new repo(req.body);
      model.save(created);
    }
  };


  var del = function(repo, req, res, next){
    var handler = finalHandler(res, true);
    var paths = parseUrl(req);
    var path = paths.shift();

    var remove = function(parent) {
      return function(err, model){
        if(err || !model) handler(err); // errored out(500), or no matching model(still 200)
        else {
          model.remove();
          parent.save(handler);
        }
      };
    };

    repo.findById(path.id, function(err, model){
      var fn = remove(model);
      if(paths.length === 0) fn(err, model);
      else findchild(err, paths, model, fn);
    });
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
            get(db[segment], req, res);
          };
          break;
        case 'PUT':
          handler = function () {
            put(db[segment], req, res);
          };
          break;
        case 'POST':
          handler = function () {
            post(db[segment], req, res);
          };
          break;
        case 'DELETE':
          handler = function () {
            del(db[segment], req, res);
          };
          break;
      }
    }
    handler();
  };


