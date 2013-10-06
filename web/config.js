


(function(env){

  this.mongodb = {
    url: env.MONGODB_URL || 'mongodb://localhost:27017/DCCPolymerDemo'
  };

}).call(exports, process.env);