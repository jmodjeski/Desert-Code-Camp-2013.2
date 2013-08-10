


(function(env){

  this.mongodb = {
    url: env.MONGODB_URL || 'mongodb://localhost:27017/TimeTracker'
  };

}).call(exports, process.env);