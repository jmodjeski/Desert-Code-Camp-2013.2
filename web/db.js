
var url = require('./config').mongodb.url,
  connect = require('mongodb').MongoClient.connect,
  _ = require('underscore');

var slice = function(args){
  return Array.prototype.slice.call(args);
};

// wrapping up the connection management along with function call
var sync = function(method, query, options, cb){
    var args = slice.call(arguments, 0);
    var method = args.shift();

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

// Generic Repository class
var Repository = function(options){
  if(!options || !options.name)
    throw new Error("Missing collection name on Repository");
  this.name = options.name;
}
_.extend(Repository.prototype, {
  find:function(query, options, cb){
    var args = slice(arguments, 0);
    args.unshift('find');
    sync.apply(this, args);
  },

  create: function(items, options, cb){
    var args = slice(arguments, 0);
    args.unshift('insert');
    sync.apply(this, args);
  },

  update: function(items, options, cb){
    var args = slice(arguments, 0);
    args.unshift('update');
    sync.apply(this, args);
  },

  remove: function(items){
    var args = slice(arguments, 0);
    args.unshift('remove');
    sync.apply(this, args);
  }
});

// create the repositories
exports = module.exports = _.extend(this, {
  users: new Repository({name:'Users'}),
  trackers: new Repository({name:'Trackers'})
});
