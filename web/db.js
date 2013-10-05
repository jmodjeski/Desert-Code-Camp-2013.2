
var url = require('./config').mongodb.url,
  connect = require('mongodb').MongoClient.connect,
  _ = require('underscore');

var slice = function(args){
  return Array.prototype.slice.call(args);
};

// wrapping up the connection management along with function call
var sync = function(method){
  return function(query, options, cb) {
    connect(url, function(err, db){
      err ? cb(err) : db.collection(this.name, function(err, col){
        err ? cb(err) : col[method](query, options, function(err, result){
          if(err){
            db.close();
            cb(err);
          }
          cb(err, result, function(){
            db.close();
          });
        });
      });
    });
  };
};

// Generic Repository class
var Repository = function(options){
  if(!options || !options.name)
    throw new Error("Missing collection name on Repository");
  this.name = options.name;
}
_.extend(Repository.prototype, {
  find: sync('find'),
  create: sync('insert'),
  update: sync('update'),
  remove: sync('remove')
});

// create the repositories
exports = module.exports = _.extend(this, {
  trackers: new Repository({name:'Trackers'})
});

