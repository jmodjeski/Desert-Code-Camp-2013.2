
var url = require('./config').mongodb.url,
  connect = require('mongodb').MongoClient.connect,
  ObjectID = require('mongodb').ObjectID,
  _ = require('underscore');

var slice = function(args){
  return Array.prototype.slice.call(args);
};

var translateIds = function(objs){
  return _.map(objs, function(obj){
    obj.id = obj._id;
    return _.omit(obj, "_id");
  });
};

// wrapping up the connection management along with function call
var sync = function(fn){
  return function(query, options, cb) {
    var self = this;
    connect(url, function(err, db){
      err ? fn(err) : db.collection(self.name, function(err, col){
        fn(err, col, query, options, cb, function(){
          db.close();
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
  find: sync(function(err, coll, query, options, cb, next){
    err ? cb(err) : coll.find(query, options).toArray(function(err, result){
      cb(err, translateIds(result), next);
    });
  }),
  create: sync(function(err, coll, data, options, cb, next){
    err ? cb(err) : coll.insert(data, options, function(err, result){
      cb(err, translateIds(result)[0], next);
    });
  }),
  update: sync(function(err, coll, data, options, cb, next){
    err ? cb(err) : coll.update(data.query, data.data, options, function(err, result){
      cb(err, result, next);
    });
  }),
  remove: sync(function(err, coll, id, options, cb, next){
    var query = {"_id": ObjectID(id)};
    err ? cb(err) : coll.remove(query, options, function(err, result){
      cb(err, result, next);
    });
  })
});

// create the repositories
exports = module.exports = _.extend(this, {
  meetings: new Repository({name:'Meetings'})
});
