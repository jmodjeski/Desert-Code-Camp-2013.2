var url = require('./config').mongodb.url,
  mongoose = require('mongoose'),
  Schema = require('mongoose').Schema;

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
  title: 'string',
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number 
  }, defaultSchemaOptions)]
}, defaultSchemaOptions);

var meetingLogSchema = new Schema({
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
var Meetings = mongoose.model('Meetings', meetingSchema);
var MeetingsLog = mongoose.model('MeetingsLog', meetingLogSchema);

// create the repositories
exports = module.exports = {
  meetings: Meetings,
  meetingslog: MeetingsLog
};
