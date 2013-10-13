var url = require('./config').mongodb.url,
  mongoose = require('mongoose'),
  Schema = require('mongoose').Schema;

var meetingSchema = new Schema({
  title: 'string',
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number 
  })]
});

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
  })]
});

mongoose.connect(url);
var Meetings = mongoose.model('Meetings', meetingSchema);
var MeetingsLog = mongoose.model('MeetingsLog', meetingLogSchema);

// create the repositories
exports = module.exports = {
  meetings: Meetings,
  meetingslog: MeetingsLog
};
