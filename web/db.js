
var url = require('./config').mongodb.url,
  connect = require('mongodb').MongoClient.connect,
  _ = require('underscore');

var slice = function(args){
  return Array.prototype.slice.call(args);
};

// wrapping up the connection management along with function call
var sync = function(method){
  return function(query, options, cb) {
    var self = this;
    connect(url, function(err, db){
      err ? cb(err) : db.collection(self.name, function(err, col){
        if(method == 'find')
        {
          col[method](query, options).toArray(function(err, result){
            cb(err, result, function(){
              db.close();
            });
          });
        }
        else {
          err ? cb(err) : col[method](query, options, function(err, result){
            if(result.length == 1)
              result = result[0];

            cb(err, result, function(){
              db.close();
            });
          });
        }
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
  meetings: new Repository({name:'Meetings'})
});
