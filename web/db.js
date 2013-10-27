var url = require('./config').mongodb.url,
  mongoose = require('mongoose'),
  Schema = require('mongoose').Schema;

var collectionNames : {
  meetings: 'Meetings',
  meetingLogs: 'MeetingLogs'
};

var defaultJsonTransform = function (doc, ret, options) {
  // standardize on regular 'id' field
  ret.id = ret._id;
  // TODO: remove _id once all obects are migrated
  //delete ret._id;
};

var defaultSchemaOptions = {
  toJSON: {
    transform: defaultJsonTransform
  }
};

var meetingSchema = new Schema({
  title: String,
  logs: [ 
    { 
      type: Schema.Types.ObjectId, 
      ref: collectionNames.meetingLogs 
    }
  ],
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number
  }, defaultSchemaOptions)]
}, defaultSchemaOptions);

var meetingLogSchema = new Schema({
  meeting: { 
    type: Schema.Types.ObjectId, 
    ref: collectionNames.meetings 
  },
  startTime: Date,
  stopTime: Date,
  totalTime: Number,
  cost: Number,
  tags: [String],
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number,
    totalCost: Number
  }, defaultSchemaOptions)]
}, defaultSchemaOptions);

mongoose.connect(url);
var Meetings = mongoose.model(collectionNames.meetings, meetingSchema);
var MeetingsLog = mongoose.model(collecitonNames.meetingLogs, meetingLogSchema);

// create the repositories
exports = module.exports = {
  meetings: Meetings,
  meetingslog: MeetingsLog
};
